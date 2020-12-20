var fs = require('fs');
var fakeHtml = fs.readFileSync("./test/mocks/fake.html","utf-8");
var fakeXml = fs.readFileSync("./test/mocks/fake.txt","utf-8");

var expect = require('chai').expect;
process.env.NODE_ENV = "test"
require('../preload')


var sut = require("../Controllers/MainController")

describe('#scrapMpdLink(html)', function() {
  var expectedMpdLink = 
  "https://lh3.googleusercontent.com/cloudcast/AGY_3L-ubRCRXLbdqVcptSxivBzp5U6x49F9N6R8RFeltdZ562q4C5iVkWCJDQ=mm,dash"
  
        it('should return correct link', function() {
          expect(sut.scrapMpdLink(fakeHtml)).to.equal(expectedMpdLink)
        }) 
})

describe('#getAvailableQuality(html)', function() {
  var expectedArr = ["144", "240", "360", "480", "720", "1080", "1440", "2160"]
  it('should return an array of available quality entries', function() {
    expect(sut.getAvailableQuality(fakeXml)).to.have.members(expectedArr)
  }) 
})

process.env.NODE_ENV = ""