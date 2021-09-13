interface IDownloadingStrategy {
    // TODO: choose adequate return type
    downloadFile(url : string) : any;
    cleanup(url : string) : void;
}

export { IDownloadingStrategy }