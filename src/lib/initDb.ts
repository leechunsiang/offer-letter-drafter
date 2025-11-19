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
    // Check if data already exists
    const { data: existingCandidates } = await supabase
      .from('candidates')
      .select('id')
      .limit(1)

    if (existingCandidates && existingCandidates.length > 0) {
      console.log('Data already seeded')
      return true
    }

    console.log('Seeding initial data...')

    // Seed candidates
    const { error: candidatesError } = await supabase
      .from('candidates')
      .insert([
        {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Software Engineer',
          status: 'Pending',
          offer_date: '2023-10-26',
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Product Manager',
          status: 'Generated',
          offer_date: '2023-10-25',
        },
      ])

    if (candidatesError) {
      console.error('Error seeding candidates:', candidatesError)
      return false
    }

    // Seed template
    const { error: templateError } = await supabase
      .from('templates')
      .insert({
        name: 'Standard Offer',
        content: `Dear {{name}},

We are pleased to offer you the position of {{role}} at our company.

Start Date: {{offerDate}}

Sincerely,
HR Team`,
      })

    if (templateError) {
      console.error('Error seeding template:', templateError)
      return false
    }

    // Seed company settings
    const { error: settingsError } = await supabase
      .from('company_settings')
      .insert({
        company_name: '',
        company_address: '',
        company_website: '',
        company_phone: '',
        logo_url: '',
        primary_color: '#000000',
        sender_name: '',
        sender_email: '',
      })

    if (settingsError) {
      console.error('Error seeding settings:', settingsError)
      return false
    }

    console.log('Initial data seeded successfully')
    return true
  } catch (err) {
    console.error('Error seeding data:', err)
    return false
  }
}
