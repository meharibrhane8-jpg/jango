const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex1 = /const isVideo = p\.inlineData\.mimeType\?\.startsWith\("video\/"\);\s*return \{\s*type: isVideo \? "video" : "image",/g;

code = code.replace(regex1, `let mediaType = "image";
          if (p.inlineData.mimeType?.startsWith("video/")) mediaType = "video";
          if (p.inlineData.mimeType?.startsWith("audio/")) mediaType = "audio";
          return { 
            type: mediaType,`);

fs.writeFileSync('server.ts', code);
