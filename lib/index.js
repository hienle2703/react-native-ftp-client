import { NativeModules, NativeEventEmitter } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob'

const { RNFtpClient } = NativeModules;
const RNFtpClientEventEmitter = new NativeEventEmitter(RNFtpClient);
export var FtpFileType;
(function (FtpFileType) {
    FtpFileType["Dir"] = "dir";
    FtpFileType["File"] = "file";
    FtpFileType["Link"] = "link";
    FtpFileType["Unknown"] = "unknown";
})(FtpFileType || (FtpFileType = {}));
;
;
;
var FtpClient;
(function (FtpClient) {
    function getEnumFromString(typeString) {
        switch (typeString) {
            case "dir":
                return FtpFileType.Dir;
            case "link":
                return FtpFileType.Link;
            case "file":
                return FtpFileType.File;
            case "unknown":
            default:
                return FtpFileType.Unknown;
        }
    }
    function setup(config) {
        RNFtpClient.setup(config.ip_address, config.port, config.username, config.password);
    }
    FtpClient.setup = setup;

    function processPath(host_path_root,host, endPath) {
        switch (endPath) {
          case '..': {
            const splitHost = host.split('/')
            splitHost.pop()
            const newHost = splitHost.join('/')
            return newHost || host_path_root
          }
          case '.': {
            return host_path_root
          }
          default:
            return host + `/${endPath}`
        }
      }
    FtpClient.processPath = processPath;
  
    async function list(remote_path) {
        const files = await RNFtpClient.list(remote_path);
        return files.map((f) => {
            return {
                name: f.name,
                type: getEnumFromString(f.type),
                size: +f.size,
                timestamp: new Date(f.timestamp)
            };
        });
    }
    FtpClient.list = list;

    async function uploadFile(local_path, remote_path) {
        const localPath = local_path.substring(local_path.indexOf('s'))
        const imageName = local_path.substring(local_path.lastIndexOf('/') + 1)
        const remote = remote_path + `/${imageName}`
        return RNFtpClient.uploadFile(localPath, remote);
    }
    FtpClient.uploadFile = uploadFile;

    async function cancelUploadFile(token) {
        return RNFtpClient.cancelUploadFile(token);
    }
    FtpClient.cancelUploadFile = cancelUploadFile;

    function addProgressListener(listener) {
        return RNFtpClientEventEmitter.addListener("Progress", listener);
    }
    FtpClient.addProgressListener = addProgressListener;

    async function remove(remote_path) {
        return RNFtpClient.remove(remote_path);
    }
    FtpClient.remove = remove;

    FtpClient.ERROR_MESSAGE_CANCELLED = RNFtpClient.ERROR_MESSAGE_CANCELLED;

    async function downloadFile(file_name, remote_path) {
        const date = new Date()
        let localPath =
              RNFetchBlob.fs.dirs.DownloadDir +
              `/${Math.floor(date.getTime() + date.getSeconds() / 2)}_${file_name}`
        return RNFtpClient.downloadFile(localPath, remote_path);
    }
    FtpClient.downloadFile = downloadFile;

    async function cancelDownloadFile(token) {
        return RNFtpClient.cancelDownloadFile(token);
    }
    FtpClient.cancelDownloadFile = cancelDownloadFile;
})(FtpClient || (FtpClient = {}));
;
export default FtpClient;
