export class InvalidDirPath extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidDirPath';
    }
}

export class MissingVariable extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MissingVariable';
    }
}