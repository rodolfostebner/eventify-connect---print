export async function uploadImage(file: File) {
    // TODO: integrar com Cloudflare R2
    console.log('Uploading file:', file)

    return {
        url: 'https://fake-url.com/image.jpg'
    }
}