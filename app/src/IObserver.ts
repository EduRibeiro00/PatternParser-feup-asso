interface IObserver {
    notify(url: string) : Promise<void>;
}

export { IObserver }