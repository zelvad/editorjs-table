const fs = require('fs');
const request = require('request');

function guid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

function upload(req, res) {
  const File = req.files[0];
  
  if (File.mimetype.indexOf('image') > -1) {
    res.send({
      status: false,
      url: null,
    });
    fs.unlinkSync(File.path);
    return;
  }
  
  const post = request.post('https://pic.cloudshop.ru/upload.php', function(error, response, body){
    res.send(body);
    res.end();
  });
  const filename = guid() + '.jpg'
  const form = post.form();
  form.append('key', '2cd32b5c33e5ac425bbcfa19a32da95702a5fdfb202f168e458092b4e110a3aa');
  form.append('filename', filename);
  form.append('upfile', fs.createReadStream(File.path), {
    filename: filename,
    contentType: File.mimetype
  });
}

module.exports = upload;
