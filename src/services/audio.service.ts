import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { Media } from '@ionic-native/media/ngx';
import { ScMediaStreamModel } from 'src/models/sc-media-stream-model.model';
import { Plugins, FilesystemDirectory, FilesystemEncoding, GetUriResult, Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  constructor(private _file: File,
              private _media: Media) {
               }

  async ConvertFilePathToBlob(_tempFilePath: string): Promise<ScMediaStreamModel> {
    const { Filesystem } = Plugins;
    let testFilePath2 = Capacitor.convertFileSrc(_tempFilePath);
    let _filePath = _tempFilePath.replace(/^file:\/\/\/private/, "");
    let test = await Filesystem.readFile({
        path: testFilePath2
    });
    return new Promise((resolve, reject) => {
        let fileExtension = "";
        Filesystem.getUri({
            directory: FilesystemDirectory.Data,
            path: _filePath
        })
            .then((fileEntry: GetUriResult) => {
                let path = fileEntry.uri;
                // get the path..
                let filePath = path.substring(0, path.lastIndexOf("/"));
                let fileName = path.substring(path.lastIndexOf("/") + 1);
                // if you already know the file extension, just assign it to           // variable below
                fileExtension = fileName.match(/\.[A-z0-9]+$/i)[0].slice(1);
                // we are provided the name, so now read the file into a buffer
                return this._file.readAsArrayBuffer(path, name);
            })
            .then(buffer => {
                // get the buffer and make a blob to be saved
                let medBlob = new Blob([buffer], {
                    type: `audio/${fileExtension}`
                });

                // pass back blob and the name of the file for saving
                let audioUrl = window.URL.createObjectURL(medBlob);
                let returnObj = new ScMediaStreamModel();
                returnObj.BlobData = medBlob;
                returnObj.FileName = name;
                returnObj.AudioObjectUrl = audioUrl;

                
                resolve(returnObj);
            })
            .catch(e => reject(e));
        });
    }
    ConvertFilePathToBlob2(_tempFilePath: string): Promise<ScMediaStreamModel> {
        let _filePath = _tempFilePath.replace(/^file:\/\//, "");
        return new Promise((resolve, reject) => {
            let fileExtension = "";
            // get the path..
            let fileName = _filePath.substring(_filePath.lastIndexOf("/"));
            // if you already know the file extension, just assign it to           // variable below
            fileExtension = fileName.match(/\.[A-z0-9]+$/i)[0].slice(1);
            // we are provided the name, so now read the file into a buffer
            this._file.readAsArrayBuffer(_filePath, name).then(buffer => {
            // get the buffer and make a blob to be saved
            let medBlob = new Blob([buffer], {
                type: `audio/${fileExtension}`
            });

            // pass back blob and the name of the file for saving
            let audioUrl = window.URL.createObjectURL(medBlob);
            let returnObj = new ScMediaStreamModel();
            returnObj.BlobData = medBlob;
            returnObj.FileName = name;
            returnObj.AudioObjectUrl = audioUrl;

            
            resolve(returnObj);
            })
            .catch(e => reject(e));
        });
    }
    async ConvertFilePathToBlob3(_tempFilePath: string): Promise<ScMediaStreamModel> {
        let _filePath = _tempFilePath.replace(/^file:\/\//, "");
        return new Promise(async (resolve, reject) => {
            let fileExtension = "";
            // get the path..
            if(_filePath.includes('/private')){
                _filePath = _filePath.replace('/private', '');
            }
            let path = _filePath.substring(0,_filePath.lastIndexOf("/"));
            let fileName = _filePath.substring(_filePath.lastIndexOf("/") + 1);
            // if you already know the file extension, just assign it to           // variable below
            fileExtension = fileName.match(/\.[A-z0-9]+$/i)[0].slice(1);
            // we are provided the name, so now read the file into a buffer
            this._file.readAsArrayBuffer(_filePath, fileName).then(buffer => {
            // get the buffer and make a blob to be saved
                let medBlob = new Blob([buffer], {
                    type: `audio/${fileExtension}`
                });

                // pass back blob and the name of the file for saving
                let audioUrl = window.URL.createObjectURL(medBlob);
                let returnObj = new ScMediaStreamModel();
                returnObj.BlobData = medBlob;
                returnObj.FileName = name;
                returnObj.AudioObjectUrl = audioUrl;

                
                resolve(returnObj);
            })
            .catch(e => reject(e));
        });
    }
}
