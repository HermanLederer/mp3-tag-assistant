import { ipcMain } from 'electron';
import type { IpcMainEvent } from 'electron';

import { loadTag, updateTag } from '@metashine/native-addon';
import type { ID3Tag } from '@metashine/native-addon';

import IpcEvents from '../../common/IpcEvents';
import type { ISuppotedFile } from '../../common/SupportedFile';

function setupTagsProcess(loadedFiles: Map<string, ISuppotedFile>) {
  let currentFiles: string[] = [];
  let currentMeta: ID3Tag = [];

  ipcMain.on(
    IpcEvents.renderer.has.changedTag,
    (event: IpcMainEvent, newTag: ID3Tag) => {
      currentMeta = newTag;
      event.sender.send(IpcEvents.main.wants.toRender.meta, currentMeta);
    },
  );

  ipcMain.on(
    IpcEvents.renderer.wants.toSelectFile,
    (event: IpcMainEvent, filePath: string) => {
      // Clear selectrion and select the file
      currentFiles = [];
      currentFiles.push(filePath);

      // Load tags
      currentMeta = [];

      try {
        currentMeta = loadTag(filePath);

        // Request tag section update
        event.sender.send(IpcEvents.main.wants.toRender.meta, currentMeta);
      } catch (error) {
        event.sender.send(IpcEvents.main.wants.toRender.error, error);
      }

      // Request render update
      event.sender.send(IpcEvents.main.has.updatedSelection, currentFiles);
    },
  );

  ipcMain.on(
    IpcEvents.renderer.wants.toToggleFile,
    (event: IpcMainEvent, filePath: string) => {
      const i = currentFiles.indexOf(filePath);

      if (i > -1) {
        // Remove file from selectrion
        currentFiles.splice(i, 1);
      } else {
        // Add file to selection
        currentFiles.push(filePath);

        // Clear current tags
        currentMeta = [];
        event.sender.send(IpcEvents.main.wants.toRender.meta, currentMeta);
      }

      // Request render update
      event.sender.send(IpcEvents.main.has.updatedSelection, currentFiles);
    },
  );

  ipcMain.on(IpcEvents.renderer.wants.toSaveMeta, (event: IpcMainEvent) => {
    currentFiles.forEach((filePath) => {
      const supportedFile = loadedFiles.get(filePath);
      if (supportedFile) {
        try {
          // updateTag(supportedFile.path, currentMeta);
          console.log(currentMeta);
        } catch (error) {
          event.sender.send(IpcEvents.main.wants.toRender.error, error);
        }
      }
    });
  });
}

export default setupTagsProcess;
