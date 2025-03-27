import path from "path";

export class PackagePath {
    static replace(main: string) {
        // Handle empty or invalid input
        if (!main) return main;

        const p = path.parse(main);
        
        // Split the full path into parts
        const parts = main.split('.');
        
        // If there's only one part or no dots, return original
        if (parts.length <= 1) return main;
        
        // Get the file name with extension (last part)
        const fileName = parts[parts.length - 1];
        
        // Join all parts except the last one with path separator
        const dirPath = parts.slice(0, -1).join(path.sep);
        
        // Combine directory path with filename
        return path.join(dirPath, fileName);
    }
}