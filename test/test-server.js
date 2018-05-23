const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Get', function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });
  
  it('should return status 200 on GET', function() {
    return chai.request(app)
      .get('/')
      .then(function(res) {
        expect(res).to.have.status(200);        
      });
  });
});