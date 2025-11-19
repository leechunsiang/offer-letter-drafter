import { supabase } from './supabase'

const BUCKET_NAME = 'company-logos'

/**
 * Storage service for managing company logos in Supabase Storage
 */
export const storageService = {
  /**
   * Creates the company-logos bucket if it doesn't exist
   * Sets up public access for reading logos
   */
  async createBucketIfNotExists(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.error('Error listing buckets:', listError)
        throw listError
      }

      const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)

      if (!bucketExists) {
        // Create bucket with public access
        const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: 2097152, // 2MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
        })

        if (createError) {
          console.error('Error creating bucket:', createError)
          throw createError
        }

        console.log(`Created bucket: ${BUCKET_NAME}`)
      }
    } catch (error) {
      console.error('Error in createBucketIfNotExists:', error)
      throw error
    }
  },

  /**
   * Uploads a logo file to Supabase Storage
   * @param file - The image file to upload
   * @returns The public URL of the uploaded logo
   */
  async uploadLogo(file: File): Promise<string> {
    try {
      // Ensure bucket exists
      await this.createBucketIfNotExists()

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size exceeds 2MB limit')
      }

      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a PNG, JPG, GIF, or WebP image.')
      }

      // Generate unique filename with timestamp
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      const filePath = fileName

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error in uploadLogo:', error)
      throw error
    }
  },

  /**
   * Deletes a logo from Supabase Storage
   * @param url - The public URL or path of the logo to delete
   */
  async deleteLogo(url: string): Promise<void> {
    try {
      // Extract file path from URL
      const filePath = this.extractFilePathFromUrl(url)
      
      if (!filePath) {
        console.warn('Could not extract file path from URL:', url)
        return
      }

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath])

      if (error) {
        console.error('Error deleting logo:', error)
        throw error
      }

      console.log('Deleted logo:', filePath)
    } catch (error) {
      console.error('Error in deleteLogo:', error)
      throw error
    }
  },

  /**
   * Gets the public URL for a logo file path
   * @param path - The file path in storage
   * @returns The public URL
   */
  getLogoUrl(path: string): string {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path)

    return data.publicUrl
  },

  /**
   * Checks if a URL is a base64 data URL
   * @param url - The URL to check
   * @returns True if the URL is base64 encoded
   */
  isBase64Url(url: string): boolean {
    return url.startsWith('data:')
  },

  /**
   * Checks if a URL is a Supabase Storage URL
   * @param url - The URL to check
   * @returns True if the URL is from Supabase Storage
   */
  isStorageUrl(url: string): boolean {
    return url.includes('/storage/v1/object/public/')
  },

  /**
   * Extracts the file path from a Supabase Storage URL
   * @param url - The full public URL
   * @returns The file path or null if not a storage URL
   */
  extractFilePathFromUrl(url: string): string | null {
    if (!this.isStorageUrl(url)) {
      return null
    }

    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split(`/object/public/${BUCKET_NAME}/`)
      return pathParts[1] || null
    } catch {
      return null
    }
  },

  /**
   * Deletes the old logo before uploading a new one
   * Only deletes if the old URL is a storage URL (not base64)
   * @param oldLogoUrl - The URL of the old logo
   */
  async deleteOldLogoIfExists(oldLogoUrl: string): Promise<void> {
    if (oldLogoUrl && this.isStorageUrl(oldLogoUrl)) {
      try {
        await this.deleteLogo(oldLogoUrl)
      } catch (error) {
        // Don't throw error if deletion fails, just log it
        console.warn('Failed to delete old logo:', error)
      }
    }
  }
}
