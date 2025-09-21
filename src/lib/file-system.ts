export type FileNode = { type: 'file'; content: string };
export type DirectoryNode = { type: 'dir'; children: { [key: string]: FSNode } };
export type FSNode = FileNode | DirectoryNode;

const initialFileSystem: DirectoryNode = {
  type: 'dir',
  children: {
    home: {
      type: 'dir',
      children: {
        user: {
          type: 'dir',
          children: {
            Documents: {
              type: 'dir',
              children: {
                'report.txt': { type: 'file', content: 'This is a report.' },
              },
            },
            Downloads: {
              type: 'dir',
              children: {},
            },
            'README.md': { type: 'file', content: '# Python Shell Assistant\n\nWelcome!' },
          },
        },
      },
    },
    etc: {
      type: 'dir',
      children: {
        'config.json': { type: 'file', content: '{ "setting": "value" }' },
      },
    },
  },
};

export const createFileSystem = (): DirectoryNode => {
  // Return a deep copy to prevent mutation issues in React state
  return JSON.parse(JSON.stringify(initialFileSystem));
};

export const getNode = (fs: DirectoryNode, path: string): FSNode | undefined => {
  const parts = path.split('/').filter(Boolean);
  let currentNode: FSNode = fs;

  for (const part of parts) {
    if (currentNode.type === 'dir' && currentNode.children[part]) {
      currentNode = currentNode.children[part];
    } else {
      return undefined;
    }
  }
  return currentNode;
};

export const resolvePath = (currentPath: string, targetPath: string, fs: DirectoryNode): string => {
  if (targetPath.startsWith('/')) {
    return targetPath;
  }
  if (targetPath === '~') {
    return '/home/user';
  }

  const parts = (currentPath.endsWith('/') ? currentPath : currentPath + '/')
    .concat(targetPath)
    .split('/')
    .filter(p => p && p !== '.');

  const resolved: string[] = [];
  for (const part of parts) {
    if (part === '..') {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }

  const finalPath = '/' + resolved.join('/');
  return finalPath;
};
