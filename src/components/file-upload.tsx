import { FileIcon, X } from "lucide-react";

import { Input } from "./ui/input";
import { useState } from "react";
import { FilesService } from "../services/files-service";

interface FileUploadProps {
  value: string;
  onChange: (url?: string) => void;
}

const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];

export const FileUpload = ({value, onChange }: FileUploadProps) => {
  const [fileUrl, setFileUrl] = useState(value);
  const [extension, setExtesion] = useState(fileUrl.split(".").pop() ?? "");
  const [loading, setLoading] = useState(false);


  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try{
      const url = await FilesService.uploadFile(file);
      setFileUrl(url);
      onChange(url);
      setExtesion(url.split(".").pop() ?? "");
    } catch(error) {
      console.log("Error", error);
      alert("Ошибка загрузки файла");
    }finally {
      setLoading(false);
    }    
  };

  const handleFileDelete = async () => {
    try{
      const fileName = fileUrl.split("/").pop() ?? "";
      console.log(fileName)
      await FilesService.deleteFile(fileName);
      setFileUrl("");
      onChange("");
    } catch(error) {
      console.log("Error", error);
      alert("Ошибка удаления файла");
    }finally {
      setLoading(false);
    }    
  }

  if (fileUrl && imageExtensions.includes(extension)) {
    return (
      <div className="relative h-20 w-20">
        <img src={fileUrl} alt="Upload" className="rounded-full absolute" />
        <button
          onClick={handleFileDelete}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (fileUrl) {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-backgrounded/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline break-all"
        >
          {fileUrl}
        </a>
        <button
          onClick={handleFileDelete}
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <Input type="file" onChange={handleFileChange} disabled={loading} />
  );
};
