export interface LegalDescriptionSource {
  type: 'PastedText' | 'UploadedImage'
  text?: string
  fileName?: string
  contentType?: string
  base64Content?: string
}
