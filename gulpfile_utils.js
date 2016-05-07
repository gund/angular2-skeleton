"use strict";

var fs = require('fs');
var _ = require('lodash/core');
var util = require('util');
var path = require('path');
var CleanCSS = require('clean-css');
var sassRenderSync = require('gulp-sass').compiler.renderSync;


/**
 * FileProcessor Class
 */
class FileProcessor {

    /**
     * @param {String} file
     * @param {Object=} options
     */
    constructor(file, options) {
        this._file = file;
        this._cachedContent = null;
        this._options = _.extend({}, FileProcessor.globalOptions, options || {});
    }

    /**
     * @returns {String}
     */
    get fileName() {
        return this._file;
    }

    /**
     * @returns {String}
     */
    get fileContent() {
        return this.readFile();
    }

    /**
     * @param {String} content
     */
    set fileContent(content) {
        this.writeFile(content);
    }

    get options() {
        return Object.freeze(this._options);
    }

    /**
     * @param {Boolean=} skipCache false by default
     * @returns {String}
     */
    readFile(skipCache) {
        skipCache = !!skipCache || false;
        if (skipCache || this._cachedContent === null)
            this._cachedContent = fs.readFileSync(this.fileName, this._options.encoding);
        return this._cachedContent;
    }

    /**
     * @param {String} content
     * @returns {Boolean}
     */
    writeFile(content) {
        try {
            fs.writeFileSync(this.fileName, content, {
                encoding: this._options.encoding
            });
            this._cachedContent = content;
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     * @returns {String}
     */
    toString() {
        return this.fileContent;
    }

}

FileProcessor.globalOptions = {
    encoding: 'utf-8'
};


class InMemFileProcessor extends FileProcessor {

    /**
     * @param {String} fileContent
     * @param {Object=} options
     * @param {String=} realName
     */
    constructor(fileContent, options, realName) {
        realName = realName || `In-memory file #${InMemFileProcessor.fileCounter++}`;
        super(realName, options);
        this._cachedContent = fileContent;
    }

    /** @inheritDoc */
    readFile(skipCache) {
        return this._cachedContent;
    }

    /** @inheritDoc */
    writeFile(content) {
        this._cachedContent = content;
        return true;
    }
}

InMemFileProcessor.fileCounter = 0;


class PipedFileProcessor extends FileProcessor {

    /** @inheritDoc */
    constructor(file, options) {
        super(file, options);
        this._contentVisitor = this.defaultContentVisitor;
    }

    /** @param {Function} visitorFn */
    set contentVisitor(visitorFn) {
        if (typeof visitorFn !== 'function') throw Error('Invalid visitor function');
        this._contentVisitor = visitorFn;
    }

    /** @inheritDoc */
    readFile(skipCache) {
        this._cachedContent = this._contentVisitor(super.readFile(skipCache));
        return this._cachedContent;
    }

    static defaultContentVisitor(content) {
        return content;
    }

}


/**
 * FilePipeMethod Class
 * @abstract
 */
class FilePipeMethod {
    /**
     * @abstract
     * @param {String} content
     * @param {Object=} options
     * @return {String}
     */
    static executePipe(content, options) {
        throw 'FilePipeMethod#executePipe not implemented';
    }
}


class FileProcessorPipe {

    /**
     * @param {PipedFileProcessor} fileProcessor
     */
    constructor(fileProcessor) {
        if (!(fileProcessor instanceof PipedFileProcessor)) {
            console.error(`Invalid fileProcessor of type ${typeof fileProcessor}, must be PipedFileProcessor`);
            return Object.create(null);
        }
        this._fileProcessor = fileProcessor;
        this._fileProcessor.contentVisitor = (content) => this.runPipeSequence(content);
        /**
         * @type {String}
         * @private
         */
        this._prevFileContent = null;
        /**
         * @type {Array.<FilePipeMethod>}
         * @private
         */
        this._pipes = [];
    }

    get fileProcessor() {
        return this._fileProcessor;
    }

    /**
     * @param {FilePipeMethod} pipe
     * @return FileProcessorPipe
     */
    addPipe(pipe) {
        if (typeof pipe.executePipe !== 'function') {
            console.error(`Invalid pipe of type ${typeof pipe} [${util.inspect(pipe)}]`);
            return this;
        }
        this._pipes.push(pipe);
        return this;
    }

    /**
     * @param {String} content
     * @return {String}
     */
    runPipeSequence(content) {
        if (this._prevFileContent !== content) {
            this._prevFileContent = content;
            let options = _.extend({}, this._fileProcessor.options, {
                fileName: this._fileProcessor.fileName
            });
            return this._pipes.reduce(
                (content, pipe) => pipe.executePipe(content, options),
                content
            );
        } else return content;
    }

}


class CssPipeMethod extends FilePipeMethod {

    /** @inheritDoc */
    static executePipe(content, options) {
        options = _.extend({}, CssPipeMethod.globalOptions, options);
        if (options.minify) content = this.minifyCss(content);
        return content;
    }

    /** @param {String} content */
    static minifyCss(content) {
        return new CleanCSS().minify(content).styles;
    }

}

CssPipeMethod.globalOptions = {
    minify: false
};


class SassPipeMethod extends FilePipeMethod {

    /** @inheritDoc */
    static executePipe(content, options) {
        return this.sassToCss(content, options.fileName);
    }

    /**
     * @param {String} content
     * @param {String} fileName
     */
    static sassToCss(content, fileName) {
        let options = {};
        options.data = content;
        options.indentedSyntax = path.extname(fileName) === '.sass';
        return sassRenderSync(options).css.toString();
    }

}


module.exports = {
    /**
     * @param {String} file
     * @param {Object=} options
     * @returns FileProcessor
     */
    getFileProcessor: (file, options) => new FileProcessor(file, options)
    /**
     * @param {String} file
     * @param {Object=} options
     * @returns FileProcessor
     */
    ,
    getCssFileProcessor: (file, options) => new FileProcessorPipe(new PipedFileProcessor(file, options))
        .addPipe(CssPipeMethod)
        .fileProcessor
    /**
     * @param {String} file
     * @param {Object=} options
     * @returns FileProcessor
     */
    ,
    getSassFileProcessor: (file, options) => new FileProcessorPipe(new PipedFileProcessor(file, options))
        .addPipe(SassPipeMethod)
        .addPipe(CssPipeMethod)
        .fileProcessor
};
