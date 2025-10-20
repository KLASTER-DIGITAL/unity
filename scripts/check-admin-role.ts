/**
 * Script to check and update super_admin role for diary@leadshunter.biz
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg1MjI2OTQsImV4cCI6MjA0NDA5ODY5NH0.Ql-Ql5Ql5Ql5Ql5Ql5Ql5Ql5Ql5Ql5Ql5Ql5Ql5Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndUpdateAdminRole() {
  try {
    console.log('🔍 Checking admin role for diary@leadshunter.biz...');

    // Проверяем текущую роль
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', 'diary@leadshunter.biz')
      .single();

    if (fetchError) {
      console.error('❌ Error fetching profile:', fetchError);
      return;
    }

    if (!profile) {
      console.error('❌ Profile not found for diary@leadshunter.biz');
      return;
    }

    console.log('✅ Profile found:', profile);

    if (profile.role === 'super_admin') {
      console.log('✅ User already has super_admin role');
      return;
    }

    console.log('⚠️ User role is:', profile.role, '- updating to super_admin...');

    // Обновляем роль
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'super_admin' })
      .eq('id', profile.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating role:', updateError);
      return;
    }

    console.log('✅ Role updated successfully:', updated);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndUpdateAdminRole();

