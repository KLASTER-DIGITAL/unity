-- Script to create test data for user rustam@leadshunter.biz
-- Run this after migrations are applied
-- Date: 2025-10-14

-- Note: Replace USER_ID with actual UUID of rustam@leadshunter.biz user
-- You can get it by running: SELECT id FROM auth.users WHERE email = 'rustam@leadshunter.biz';

-- Example test entries for the last 7 days
DO $$
DECLARE
    v_user_id UUID;
    v_entry_id UUID;
    v_summary_id UUID;
    v_date TIMESTAMPTZ;
    i INTEGER;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'rustam@leadshunter.biz';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User rustam@leadshunter.biz not found';
    END IF;

    -- Create 10 test entries over the last 7 days
    FOR i IN 1..10 LOOP
        v_entry_id := gen_random_uuid();
        v_summary_id := gen_random_uuid();
        v_date := NOW() - (i || ' days')::INTERVAL + (random() * INTERVAL '12 hours');

        -- Insert diary entry
        INSERT INTO diary_entries (
            id,
            user_id,
            text,
            sentiment,
            category,
            tags,
            ai_reply,
            ai_summary,
            ai_insight,
            is_achievement,
            mood,
            created_at,
            updated_at
        ) VALUES (
            v_entry_id,
            v_user_id,
            CASE i
                WHEN 1 THEN 'Сегодня завершил важный проект по разработке нового модуля. Команда отлично поработала!'
                WHEN 2 THEN 'Утренняя пробежка 5 км. Чувствую прилив энергии и готовность к новым свершениям.'
                WHEN 3 THEN 'Провел продуктивную встречу с клиентом. Договорились о сотрудничестве на следующий квартал.'
                WHEN 4 THEN 'Изучил новую технологию React Server Components. Очень интересный подход к рендерингу.'
                WHEN 5 THEN 'Помог коллеге разобраться со сложной задачей. Приятно делиться знаниями.'
                WHEN 6 THEN 'Закончил читать книгу "Чистый код". Много полезных инсайтов для улучшения кода.'
                WHEN 7 THEN 'Семейный ужин с друзьями. Отличное настроение и теплая атмосфера.'
                WHEN 8 THEN 'Запустил новую фичу в продакшн. Все работает стабильно, пользователи довольны.'
                WHEN 9 THEN 'Медитация 20 минут утром. Помогает сосредоточиться и начать день правильно.'
                WHEN 10 THEN 'Написал статью в блог о лучших практиках TypeScript. Получил много положительных отзывов.'
            END,
            CASE 
                WHEN i % 3 = 0 THEN 'neutral'
                WHEN i % 5 = 0 THEN 'negative'
                ELSE 'positive'
            END,
            CASE i % 5
                WHEN 0 THEN 'Работа'
                WHEN 1 THEN 'Здоровье'
                WHEN 2 THEN 'Обучение'
                WHEN 3 THEN 'Семья'
                ELSE 'Личное развитие'
            END,
            ARRAY[
                CASE i % 4
                    WHEN 0 THEN 'проект'
                    WHEN 1 THEN 'спорт'
                    WHEN 2 THEN 'обучение'
                    ELSE 'достижение'
                END
            ],
            CASE i
                WHEN 1 THEN 'Отличная работа! 🎉 Завершение проекта - это всегда большое достижение. Продолжай в том же духе!'
                WHEN 2 THEN 'Супер! 🏃‍♂️ Регулярные тренировки - ключ к здоровью и энергии. Так держать!'
                WHEN 3 THEN 'Прекрасно! 🤝 Успешные переговоры открывают новые возможности. Молодец!'
                WHEN 4 THEN 'Здорово! 📚 Постоянное обучение - путь к профессиональному росту. Продолжай развиваться!'
                WHEN 5 THEN 'Замечательно! 🤗 Помощь коллегам укрепляет команду. Ты делаешь важное дело!'
                WHEN 6 THEN 'Отлично! 📖 Чтение профессиональной литературы повышает квалификацию. Так держать!'
                WHEN 7 THEN 'Прекрасно! 👨‍👩‍👧‍👦 Время с близкими бесценно. Цени эти моменты!'
                WHEN 8 THEN 'Браво! 🚀 Успешный деплой - результат качественной работы. Поздравляю!'
                WHEN 9 THEN 'Отлично! 🧘‍♂️ Медитация помогает сохранять баланс. Продолжай практиковать!'
                ELSE 'Супер! ✍️ Делиться знаниями - значит расти самому. Молодец!'
            END,
            CASE i
                WHEN 1 THEN 'Завершение важного проекта'
                WHEN 2 THEN 'Утренняя пробежка 5 км'
                WHEN 3 THEN 'Продуктивная встреча с клиентом'
                WHEN 4 THEN 'Изучение React Server Components'
                WHEN 5 THEN 'Помощь коллеге'
                WHEN 6 THEN 'Прочитал "Чистый код"'
                WHEN 7 THEN 'Семейный ужин'
                WHEN 8 THEN 'Запуск новой фичи'
                WHEN 9 THEN 'Медитация 20 минут'
                ELSE 'Написал статью в блог'
            END,
            CASE i
                WHEN 1 THEN 'Новые вызовы помогают расти профессионально и укрепляют уверенность в своих силах.'
                WHEN 2 THEN 'Забота о здоровье - это инвестиция в будущее и источник энергии для достижений.'
                WHEN 3 THEN 'Успешные переговоры открывают двери к новым возможностям и партнерствам.'
                WHEN 4 THEN 'Постоянное обучение держит тебя на передовой технологий и делает ценным специалистом.'
                WHEN 5 THEN 'Помощь другим не только укрепляет команду, но и углубляет собственные знания.'
                WHEN 6 THEN 'Профессиональная литература дает инструменты для создания качественного кода.'
                WHEN 7 THEN 'Время с близкими наполняет жизнь смыслом и дает силы для новых свершений.'
                WHEN 8 THEN 'Успешный запуск - результат тщательной подготовки и командной работы.'
                WHEN 9 THEN 'Медитация помогает сохранять ясность ума и эмоциональный баланс.'
                ELSE 'Делясь знаниями, ты помогаешь сообществу и укрепляешь свою экспертизу.'
            END,
            true,
            CASE i % 6
                WHEN 0 THEN 'вдохновение'
                WHEN 1 THEN 'радость'
                WHEN 2 THEN 'удовлетворение'
                WHEN 3 THEN 'энтузиазм'
                WHEN 4 THEN 'благодарность'
                ELSE 'уверенность'
            END,
            v_date,
            v_date
        );

        -- Insert entry summary for token optimization
        INSERT INTO entry_summaries (
            id,
            entry_id,
            user_id,
            summary_json,
            tokens_used,
            created_at,
            updated_at
        ) VALUES (
            v_summary_id,
            v_entry_id,
            v_user_id,
            jsonb_build_object(
                'text', CASE i
                    WHEN 1 THEN 'Завершение важного проекта'
                    WHEN 2 THEN 'Утренняя пробежка 5 км'
                    WHEN 3 THEN 'Продуктивная встреча с клиентом'
                    WHEN 4 THEN 'Изучение React Server Components'
                    WHEN 5 THEN 'Помощь коллеге'
                    WHEN 6 THEN 'Прочитал "Чистый код"'
                    WHEN 7 THEN 'Семейный ужин'
                    WHEN 8 THEN 'Запуск новой фичи'
                    WHEN 9 THEN 'Медитация 20 минут'
                    ELSE 'Написал статью в блог'
                END,
                'insight', CASE i
                    WHEN 1 THEN 'Новые вызовы помогают расти профессионально'
                    WHEN 2 THEN 'Забота о здоровье - инвестиция в будущее'
                    WHEN 3 THEN 'Успешные переговоры открывают новые возможности'
                    WHEN 4 THEN 'Постоянное обучение держит на передовой'
                    WHEN 5 THEN 'Помощь другим углубляет собственные знания'
                    WHEN 6 THEN 'Профессиональная литература дает инструменты'
                    WHEN 7 THEN 'Время с близкими наполняет жизнь смыслом'
                    WHEN 8 THEN 'Успешный запуск - результат командной работы'
                    WHEN 9 THEN 'Медитация помогает сохранять баланс'
                    ELSE 'Делясь знаниями, укрепляешь экспертизу'
                END,
                'mood', CASE i % 6
                    WHEN 0 THEN 'вдохновение'
                    WHEN 1 THEN 'радость'
                    WHEN 2 THEN 'удовлетворение'
                    WHEN 3 THEN 'энтузиазм'
                    WHEN 4 THEN 'благодарность'
                    ELSE 'уверенность'
                END,
                'sentiment', CASE 
                    WHEN i % 3 = 0 THEN 'neutral'
                    WHEN i % 5 = 0 THEN 'negative'
                    ELSE 'positive'
                END,
                'contexts', ARRAY['Я сам'],
                'tags', ARRAY[
                    CASE i % 4
                        WHEN 0 THEN 'проект'
                        WHEN 1 THEN 'спорт'
                        WHEN 2 THEN 'обучение'
                        ELSE 'достижение'
                    END
                ],
                'achievements', ARRAY[
                    CASE i
                        WHEN 1 THEN 'Завершил важный проект'
                        WHEN 2 THEN 'Пробежал 5 км'
                        WHEN 8 THEN 'Запустил новую фичу'
                        ELSE 'Достижение дня'
                    END
                ],
                'keywords', ARRAY['развитие', 'достижение', 'прогресс'],
                'excerpt', LEFT(
                    CASE i
                        WHEN 1 THEN 'Сегодня завершил важный проект по разработке нового модуля'
                        WHEN 2 THEN 'Утренняя пробежка 5 км. Чувствую прилив энергии'
                        ELSE 'Запись дня'
                    END, 200
                ),
                'confidence', 0.85 + (random() * 0.15)
            ),
            120 + floor(random() * 80)::INTEGER,
            v_date,
            v_date
        );

    END LOOP;

    RAISE NOTICE 'Successfully created 10 test entries for user %', v_user_id;
END $$;

