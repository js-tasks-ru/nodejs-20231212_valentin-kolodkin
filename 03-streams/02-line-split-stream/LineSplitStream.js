const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.encoding = options.encoding;
    this.separator = os.EOL;

    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    const chunkAsString = chunk.toString(this.encoding);
    this.buffer += chunkAsString;

    if (this.buffer.includes(this.separator)) {
      const bufferSeparated = this.buffer.split(this.separator);

      for (let i = 0; i < bufferSeparated.length - 1; i++) {
        this.push(bufferSeparated[i]);
      }

      this.buffer = bufferSeparated[bufferSeparated.length - 1];
    }

    callback(null);
  }

  _flush(callback) {
    if (this.buffer && this.buffer !== '') {
      this.push(this.buffer);
      this.buffer = '';
    }

    callback(null);
  }
}

module.exports = LineSplitStream;
