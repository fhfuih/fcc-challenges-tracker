/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai
          .request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Required field filled in',
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Title');
            assert.equal(res.body.issue_text, 'text');
            assert.equal(res.body.created_by, 'Functional Test - Required field filled in');
            done();
          })
      });
      
      test('Missing required fields', function(done) {
        chai
          .request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            created_by: 'Functional Test - Missing field filled in',
          })
          .end(function (err, res) {
            assert.equal(res.status, 400);
            assert.equal(res.text, 'missing inputs');
            done();
          })
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai
          .request(server)
          .put('/api/issues/test')
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 400);
            assert.equal(res.text, 'no updated field sent');
            done();
          })
      });
      
      test('One field to update', async function() {
        const requester = chai.request(server).keepOpen();
        const data = await requester.get('/api/issues/test');
        const { _id } = data.body[0];
        
        const res = await requester
          .put('/api/issues/test')
          .send({
            _id,
            issue_text: 'Functional Test - One field to update'
          });
        
        assert.equal(res.status, 200);
        assert.equal(res.text, 'successfully updated');
        
        const _res = await requester.get('/api/issues/test').query({ _id });
        assert.equal(_res.status, 200);
        assert.equal(_res.body[0].issue_text, 'Functional Test - One field to update');
        
        requester.close();
      });
      
      test('Multiple fields to update', async function() {
        const requester = chai.request(server).keepOpen();
        const data = await requester.get('/api/issues/test');
        const { _id } = data.body[0];
        
        const res = await requester
          .put('/api/issues/test')
          .send({
            _id,
            issue_text: 'Functional Test - Multiple field to update',
            status_text: 'updated',
          });
        
        assert.equal(res.status, 200);
        assert.equal(res.text, 'successfully updated');
        
        const _res = await requester.get('/api/issues/test').query({ _id });
        assert.equal(_res.status, 200);
        assert.equal(_res.body[0].status_text, 'updated');
        assert.equal(_res.body[0].issue_text, 'Functional Test - Multiple field to update');
        
        requester.close();
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({ open: true })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.isTrue(res.body[0].open);
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({ open: true, issue_title: 'Title' })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.isTrue(res.body[0].open);
          assert.equal(res.body[0].issue_title, 'Title');
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai
          .request(server)
          .delete('/api/issues/test')
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 400);
            assert.equal(res.text, '_id error');
            done();
          });
      });
      
      test('Valid _id', async function() {
        const requester = chai.request(server).keepOpen();
        const data = await requester.get('/api/issues/test');
        const { _id } = data.body[0];
        
        const res = await requester
          .delete('/api/issues/test')
          .send({ _id });
        assert.equal(res.status, 200);
        assert.equal(res.text, `deleted ${_id}`);
        requester.close();          
      });
      
    });

});
