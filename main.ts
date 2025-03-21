// Import necessary modules from Obsidian API
import { App, Notice, Plugin, TFile, TFolder } from 'obsidian';

// Define a class that extends the Plugin class from Obsidian
export default class CustomIndexGeneratorPlugin extends Plugin {

  // The onload method is called when the plugin is loaded by Obsidian
  async onload() {
    // Add a ribbon icon to the Obsidian interface
    // 'sheets-in-box' is the icon name, 'Sample Plugin' is the hover text
    const ribbonIconEl = this.addRibbonIcon('sheets-in-box', 'Sample Plugin', async (evt: MouseEvent) => {
      // Array of folder paths to scan
      const folderPaths = ["Resources", "General", "Areas", "Archives", "Clippings", "Projects"];
      
      // Process each folder in the array
      for (const folderPath of folderPaths) {
        // The note title will match the folder name
        const noteTitle = `${folderPath} Index`;
        
        // Try to get the note if it already exists
        let file = this.app.vault.getAbstractFileByPath(noteTitle + ".md");
        
        // If the note doesn't exist, create it
        if (!file) {
          file = await this.app.vault.create(noteTitle + ".md", "");
          new Notice(`Note "${noteTitle}" created!`); // Show a notification
        }
        
        // Get the reference to the folder we want to scan
        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        
        // Check if the folder exists and is actually a folder
        if (folder && folder instanceof TFolder) {
          // Generate a formatted, hierarchical list of files in the folder
          const fileList = this.formatFolderStructure(folder, 0);
          
          // Create content with just a brief description and the file list
          // Removed the redundant header since the note title already contains this information
          const content = `This is an auto-generated index of files in the ${folderPath} folder.\n\n${fileList}`;
          
          // Update the content of the note with the file list
          await this.app.vault.modify(file as TFile, content);
          new Notice(`Note "${noteTitle}" updated with file list from "${folderPath}".`);
        } else {
          // Show an error notification if the folder doesn't exist or is empty
          new Notice(`Folder "${folderPath}" not found or is empty.`);
        }
      }
      
      new Notice(`All index notes have been generated or updated.`);
    });
    
    // Add a CSS class to the ribbon icon for styling purposes
    ribbonIconEl.addClass('my-plugin-ribbon-class');
  }
  
  // Helper method to format the folder structure recursively
  formatFolderStructure(folder: TFolder, indentLevel: number): string {
    // Calculate the indentation based on the level in the folder hierarchy
    // Using 4 spaces per indent level as requested
    const indent = '    '.repeat(indentLevel);
    
    // Start with the folder name
    let fileList = `${indent}- ${folder.name}\n`;
    
    // Iterate through each child in the folder
    for (const child of folder.children) {
      if (child instanceof TFolder) {
        // If the child is a folder, recursively format its structure
        // and increase the indent level
        fileList += this.formatFolderStructure(child, indentLevel + 1);
      } else if (child instanceof TFile && child.extension === 'md') {
        // If the child is a markdown file, create a clickable Obsidian link
        // Remove the .md extension for cleaner display
        const fileNameWithoutExtension = child.name.replace('.md', '');
        // Create a WikiLink format that Obsidian uses: [[filename]]
        const fileLink = `[[${fileNameWithoutExtension}]]`;
        // Add the link to the list with proper indentation using the same 4-space indent
        fileList += `${indent}    + ${fileLink}\n`;
      }
    }
    
    return fileList;
  }
  
  // The onunload method is called when the plugin is disabled or uninstalled
  onunload() {
    // Any cleanup code would go here if needed
  }
}


// The following is to make a canvas view -- FUTURE USE
// import { App, Notice, Plugin, TFile, TFolder } from 'obsidian';

// interface CanvasNode {
//   id: string;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   type: string;
//   text?: string;
//   file?: string;
// }

// interface CanvasEdge {
//   id: string;
//   fromNode: string;
//   fromSide: string;
//   toNode: string;
//   toSide: string;
// }

// export default class CustomIndexGeneratorPlugin extends Plugin {
//   async onload() {
//     const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', async (evt: MouseEvent) => {
//       const canvasFileName = "Canvas View.canvas"; // Change this to the desired canvas file name
//       const folderPath = "Resources"; // Change this to your target folder path

//       // Get or create the canvas file
//       let file = this.app.vault.getAbstractFileByPath(canvasFileName);
//       if (!file) {
//         file = await this.app.vault.create(canvasFileName, "");
//         new Notice(`Canvas file "${canvasFileName}" created!`);
//       }

//       // Get the list of Markdown files in the folder and format it as a canvas view
//       const folder = this.app.vault.getAbstractFileByPath(folderPath);
//       if (folder && folder instanceof TFolder) {
//         const canvasData = this.createCanvasData(folder, 0, -30, -30);

//         // Write the canvas data to the file
//         await this.app.vault.modify(file as TFile, JSON.stringify(canvasData, null, 2));
//         new Notice(`Canvas file "${canvasFileName}" updated with canvas view from "${folderPath}".`);
//       } else {
//         new Notice(`Folder "${folderPath}" not found or is empty.`);
//       }
//     });

//     ribbonIconEl.addClass('my-plugin-ribbon-class');
//   }

//   createCanvasData(folder: TFolder, x: number, y: number, indentLevel: number) {
//     const nodes: CanvasNode[] = [];
//     const edges: CanvasEdge[] = [];
//     let nodeId = 0;
    
//     const createNode = (name: string, x: number, y: number, type: string, file?: string): CanvasNode => {
//       return {
//         id: `node-${nodeId++}`,
//         x: x,
//         y: y,
//         width: 250,
//         height: 60,
//         type: type,
//         text: type === 'text' ? name : undefined,
//         file: file
//       };
//     };

//     const addFolderNodes = (folder: TFolder, x: number, y: number, indentLevel: number, parentNodeId: string) => {
//       const folderNode = createNode(folder.name, x, y, 'text');
//       nodes.push(folderNode);
//       if (parentNodeId) {
//         edges.push({
//           id: `edge-${nodeId++}`,
//           fromNode: parentNodeId,
//           fromSide: "bottom",
//           toNode: folderNode.id,
//           toSide: "top"
//         });
//       }

//       let currentY = y + 100; // Increase spacing for subfolders and files
//       for (const child of folder.children) {
//         if (child instanceof TFolder) {
//           currentY = addFolderNodes(child, x + 300, currentY, indentLevel + 1, folderNode.id); // Increase x-spacing for subfolders
//         } else if (child instanceof TFile && child.extension === 'md') {
//           const fileNode = createNode(child.name.replace('.md', ''), x + 300, currentY, 'file', child.path); // Adjust x-spacing for files
//           nodes.push(fileNode);
//           edges.push({
//             id: `edge-${nodeId++}`,
//             fromNode: folderNode.id,
//             fromSide: "bottom",
//             toNode: fileNode.id,
//             toSide: "top"
//           });
//           currentY += 100;
//         }
//       }
//       return currentY;
//     };

//     addFolderNodes(folder, x, y, indentLevel, "");
//     return { nodes, edges };
//   }

//   onunload() {
//     // Any cleanup if necessary
//   }
// }
