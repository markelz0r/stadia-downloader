var fs = require('fs');
var fakeHtml = fs.readFileSync("./test/mocks/fake.html","utf-8");
var expectedMpdLink = "https://lh3.googleusercontent.com/cloudcast/AGY_3L-ubRCRXLbdqVcptSxivBzp5U6x49F9N6R8RFeltdZ562q4C5iVkWCJDQ=mm,dash"
var expect = require('chai').expect;
process.env.NODE_ENV = "test"
require('../preload')


var sut = require("../Controllers/MainController")

describe('#scrapMpdLink(html)', function() {
        it('should return correct link', function() {
          expect(sut.scrapMpdLink(fakeHtml)).to.equal(expectedMpdLink)
        }) 
})