import { createClient } from '@supabase/supabase-js'

// 🔐 Replace with your actual Supabase values
const supabase = createClient(
  'https://awnuvpcsqxrmepudhuwd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3bnV2cGNzcXhybWVwdWRodXdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA2OTgwMCwiZXhwIjoyMDY2NjQ1ODAwfQ.v3Oqf-DgqVPktpkU-o8k-BehrazwmJEOG8apRIYx9rg' // service_role key from Supabase
)

async function deleteUserByEmail(email) {
    const { data, error } = await supabase.auth.admin.listUsers()
    if (error) {
      console.error('❌ Error listing users:', error)
      return
    }
  
    const user = data?.users?.find(u => u.email === email)
    if (!user) {
      console.log(`❌ User ${email} not found.`)
      return
    }
  
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('❌ Error deleting user:', deleteError)
    } else {
      console.log(`✅ Deleted user ${email} successfully.`)
    }
  }
  
deleteUserByEmail('dennis.k.parekh@gmail.com')