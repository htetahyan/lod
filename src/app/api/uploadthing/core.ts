import { createUploadthing, type FileRouter } from "uploadthing/next";


const f = createUploadthing();


// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Route for payment receipt images
  paymentProof: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // In a real app, you would authenticate the user here
      // For now, we'll just allow any request
      return { 
        // You can pass any metadata you want to the onUploadComplete callback
        timestamp: new Date().toISOString(),
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code runs on your server after upload is complete
      console.log("Upload complete for payment proof");
      console.log("File URL:", file.url);

      // Return data that will be sent to the client
      return {
        url: file.url,
        name: file.name,
        size: file.size,
        timestamp: metadata.timestamp,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;