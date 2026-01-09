import React, { ChangeEvent, Fragment, useCallback, useRef, useState } from "react";

import { useImage } from "../../hooks/use-image";
import { MenuButton } from "../menu-button";

const ImageButton = () => {
  const { canInsert, insert } = useImage();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleClick = useCallback(() => {
    fileInput.current?.click();
  }, []);

  const uploadImageToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const onUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const target = e.target;
      const file = target.files?.[0];

      if (!file?.type.startsWith("image/")) {
        target.value = "";
        return;
      }

      setUploading(true);

      try {
        // Upload to Cloudinary
        const uploadedImage = await uploadImageToCloudinary(file);

        // Insert image with Cloudinary URL and dimensions
        insert({
          src: uploadedImage.url,
          alt: uploadedImage.display_name || file.name,
          width: uploadedImage.width,
          height: uploadedImage.height,
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        // Optionally show user-friendly error message
        alert("Failed to upload image. Please try again.");
      } finally {
        setUploading(false);
        // Reset input value to allow uploading same file again
        target.value = "";
      }
    },
    [insert]
  );

  return (
    <Fragment>
      <MenuButton
        icon="Image"
        tooltip={uploading ? "Uploading..." : "Insert Image"}
        disabled={!canInsert || uploading}
        onClick={handleClick}
      />
      <input
        style={{ display: "none" }}
        type="file"
        accept="image/*"
        ref={fileInput}
        onChange={onUpload}
        disabled={uploading}
      />
    </Fragment>
  );
};

export default ImageButton;

// import React, { ChangeEvent, Fragment, useCallback, useRef } from "react";
// import { MenuButton } from "../menu-button";
// import { useEditorState } from "@tiptap/react";
// import { useTiptapContext } from "../provider";
// import UploadWidget from "@/components/Cloudinary/upload-widget";
// import MediaLibrary from "@/components/Cloudinary/media-library";

// const ImageButton = () => {
//   const { editor } = useTiptapContext();
//   const state = useEditorState({
//     editor,
//     selector: (ctx) => {
//       return {
//         active: ctx.editor.isActive("image"),
//         disabled: !ctx.editor.isEditable,
//       };
//     },
//   });

//   //  const fileInput = useRef<HTMLInputElement>(null);
//   //  const handleClick = useCallback(() => {
//   //    fileInput.current?.click();
//   //  }, []);

//   //  const onUpload = useCallback(
//   //    (e: ChangeEvent<HTMLInputElement>) => {
//   //      const target = e.target;
//   //      const file = target.files?.[0];
//   //      if (file?.type.startsWith("image/")) {
//   //        const url = URL.createObjectURL(file);
//   //        editor.chain().setImage({ src: url }).focus().run();
//   //      }
//   //    },
//   //    [editor]
//   //  );

//   return (
//     //  <MediaLibrary
//     //    onInsert={({ assets }: any) => {
//     //      if (!Array.isArray(assets)) return;
//     //      const image = assets[0];
//     //      console.log(image);
//     //      editor
//     //        .chain()
//     //        .focus()
//     //        .insertImage({
//     //          src: image.url,
//     //          width: image.width,
//     //          height: image.height,
//     //          // originalWidth: image.width,
//     //          // originalHeight: image.height,
//     //        })
//     //        .run();
//     //      //   editor.chain().focus().setImageBlock({ src: image.url, caption: "" }).run();
//     //    }}
//     //  >
//     //    {({ open }) => {
//     //      return <MenuButton icon="Image" tooltip="Image" {...state} onClick={open} />;
//     //    }}
//     //  </MediaLibrary>

//     <UploadWidget
//       onSuccess={(result, widget) => {
//         // @ts-ignore
//         const image = result.info!;
//         editor
//           .chain()
//           .focus()
//           .insertImage({
//             src: image.url,
//             width: image.width,
//             height: image.height,
//             // originalWidth: image.width,
//             // originalHeight: image.height,
//           })
//           .run();
//         widget.close();
//       }}
//     >
//       {({ open }) => {
//         return (
//           <MenuButton icon="Image" tooltip="Image" {...state} onClick={open} />
//         );
//       }}
//     </UploadWidget>

//     //  <Fragment>
//     //    <MenuButton icon="Image" tooltip="Image" {...state} onClick={handleClick} />
//     //    <input
//     //      style={{ display: "none" }}
//     //      type="file"
//     //      accept="image/*"
//     //      ref={fileInput}
//     //      onChange={onUpload}
//     //    />
//     //  </Fragment>
//   );
// };

// export default ImageButton;
