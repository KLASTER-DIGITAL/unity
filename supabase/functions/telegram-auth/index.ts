// Deno types declaration
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

// Функция для валидации Telegram hash
async function validateTelegramHash(data: TelegramAuthData, botToken: string): Promise<boolean> {
  const { hash, ...userData } = data
  
  // Создаем строку для проверки
  const dataCheckString = Object.keys(userData)
    .sort()
    .map(key => `${key}=${userData[key as keyof typeof userData]}`)
    .join('\n')
  
  // Создаем секретный ключ
  const secretKey = new TextEncoder().encode(botToken)
  
  try {
    // Вычисляем HMAC-SHA256
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      secretKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(dataCheckString))
    
    const hashBuffer = new Uint8Array(32)
    for (let i = 0; i < hash.length; i += 2) {
      hashBuffer[i / 2] = parseInt(hash.substr(i, 2), 16)
    }
    
    const computedHash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    return computedHash === hash
  } catch (error) {
    console.error('Hash validation error:', error)
    return false
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const { telegramData, action = 'auth' }: { telegramData: TelegramAuthData, action?: 'auth' | 'link' } = await req.json()

      // Валидация данных Telegram
      if (!telegramData || !telegramData.id || !telegramData.hash) {
        return new Response(
          JSON.stringify({ error: 'Invalid Telegram data' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Проверяем, что данные свежие (не старше 24 часов)
      const now = Math.floor(Date.now() / 1000)
      if (now - telegramData.auth_date > 86400) {
        return new Response(
          JSON.stringify({ error: 'Telegram auth data expired' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Получаем токен бота
      const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
      if (!botToken) {
        return new Response(
          JSON.stringify({ error: 'Bot token not configured' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Валидация Telegram hash
      const isValidHash = await validateTelegramHash(telegramData, botToken)
      if (!isValidHash) {
        return new Response(
          JSON.stringify({ error: 'Invalid Telegram hash' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (action === 'auth') {
        // Авторизация через Telegram - проверяем существующий аккаунт
        const telegramEmail = `telegram_${telegramData.id}@unity.app`

        // Проверяем, есть ли уже пользователь с таким telegram_id
        const { data: existingProfile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('telegram_id', telegramData.id.toString())
          .single()

        if (existingProfile) {
          // Пользователь существует, авторизуем его
          try {
            const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
              email: telegramEmail,
              password: `telegram_${telegramData.id}_${telegramData.auth_date}`
            })

            if (authError) {
              return new Response(
                JSON.stringify({
                  error: 'Аккаунт существует, но не удалось войти. Попробуйте войти через email/пароль или свяжите аккаунт заново.'
                }),
                {
                  status: 400,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
              )
            }

            // Обновляем данные Telegram в профиле
            const { error: profileError } = await supabaseClient
              .from('profiles')
              .upsert({
                id: authData.user.id,
                telegram_id: telegramData.id.toString(),
                telegram_username: telegramData.username,
                telegram_avatar: telegramData.photo_url,
                updated_at: new Date().toISOString()
              })

            if (profileError) {
              console.error('Profile update error:', profileError)
            }

            return new Response(
              JSON.stringify({
                success: true,
                message: 'Авторизация через Telegram успешна',
                user: authData.user,
                session: authData.session,
                telegramData: {
                  id: telegramData.id,
                  first_name: telegramData.first_name,
                  last_name: telegramData.last_name,
                  username: telegramData.username,
                  photo_url: telegramData.photo_url
                }
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            )
          } catch (error) {
            console.error('Auth error:', error)
            return new Response(
              JSON.stringify({ error: 'Ошибка авторизации' }),
              {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            )
          }
        } else {
          // Пользователь не найден - предлагаем связать аккаунт
          return new Response(
            JSON.stringify({
              error: 'Аккаунт с таким Telegram не найден. Войдите через email/пароль и свяжите Telegram в настройках профиля.',
              code: 'USER_NOT_FOUND',
              telegramData: {
                id: telegramData.id,
                first_name: telegramData.first_name,
                last_name: telegramData.last_name,
                username: telegramData.username,
                photo_url: telegramData.photo_url
              }
            }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      } else if (action === 'link') {
        // Привязка Telegram к существующему аккаунту
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'Authorization required for linking' }),
            {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Создаем клиент с авторизацией для привязки
        const authClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          {
            global: {
              headers: { Authorization: authHeader },
            },
          }
        )

        const { data: { user }, error: userError } = await authClient.auth.getUser()
        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Обновляем профиль с данными Telegram
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .upsert({
            id: user.id,
            telegram_id: telegramData.id.toString(),
            telegram_username: telegramData.username,
            telegram_avatar: telegramData.photo_url,
            updated_at: new Date().toISOString()
          })

        if (updateError) {
          console.error('Error updating profile:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to link Telegram account' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Telegram account linked successfully',
            telegramData: {
              id: telegramData.id,
              first_name: telegramData.first_name,
              last_name: telegramData.last_name,
              username: telegramData.username,
              photo_url: telegramData.photo_url
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    if (req.method === 'GET') {
      // Проверяем переменную окружения TELEGRAM_BOT_TOKEN (без требования авторизации)
      const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')

      if (!botToken) {
        return new Response(
          JSON.stringify({
            connected: false,
            error: 'TELEGRAM_BOT_TOKEN not configured'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Токен настроен, интеграция активна
      return new Response(
        JSON.stringify({
          connected: true,
          message: 'Telegram integration is active',
          botUsername: '@diary_bookai_bot',
          domain: 'unity-diary-app.netlify.app'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
