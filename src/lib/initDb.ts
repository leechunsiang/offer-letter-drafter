import { supabase } from './supabase'

export async function initializeDatabase() {
  try {
    // Check if tables exist by trying to query candidates
    const { error } = await supabase.from('candidates').select('id').limit(1)

    if (error && error.message.includes('does not exist')) {
      console.log('Tables do not exist. Please run the SQL schema in Supabase dashboard.')
      console.log('Instructions: Open DATABASE_SETUP.md for details')
      return false
    }

    if (error) {
      console.error('Database connection error:', error)
      return false
    }

    console.log('Database tables verified successfully')
    return true
  } catch (err) {
    console.error('Error checking database:', err)
    return false
  }
}

export async function seedInitialData() {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('No authenticated user, skipping seed data')
      return true
    }

    // Check if data already exists for this user
    const { data: existingTemplates } = await supabase
      .from('templates')
      .select('id')
      .limit(1)

    if (existingTemplates && existingTemplates.length > 0) {
      console.log('Data already seeded')
      return true
    }

    console.log('Seeding initial data for new user...')

    // Seed template
    await supabase.from('templates').insert({
      name: 'Standard Offer',
      content: 'Dear {{name}},<br><br>We are pleased to offer you the position of {{role}} at our company.<br><br>Start Date: {{offerDate}}<br><br>Sincerely, HR',
      user_id: user.id,
    })

    // Seed company settings
    await supabase.from('company_settings').insert({
      company_name: '',
      company_address: '',
      company_website: '',
      company_phone: '',
      logo_url: '',
      primary_color: '#000000',
      sender_name: '',
      sender_email: '',
      user_id: user.id,
    })

    console.log('Initial data seeded successfully')
    return true
  } catch (err) {
    console.error('Error seeding data:', err)
    return false
  }
}
