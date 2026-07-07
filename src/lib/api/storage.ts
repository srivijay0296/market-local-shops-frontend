import client from './client';

export const storageApi = {
  async uploadImage(file: File, bucketName: string = 'images', folder: string = 'listing'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('container', bucketName);
    formData.append('folder', folder);

    try {
      const res = await client.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.url;
    } catch (error: any) {
      console.error('Upload failed:', error.response?.data?.error || error.message);
      throw new Error(error.response?.data?.error || 'Upload failed');
    }
  }
};
