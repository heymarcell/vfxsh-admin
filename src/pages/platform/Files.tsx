import FileBrowser from "../../components/fs/FileBrowser";

export default function Files() {
  return (
    <div className="h-[calc(100vh-6rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Files</h1>
        <p className="text-muted-foreground mt-2">
          Browse and manage distributed files.
        </p>
      </div>
      <div className="h-full pb-10">
        <FileBrowser />
      </div>
    </div>
  );
}
