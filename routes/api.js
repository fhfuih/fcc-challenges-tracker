/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app, cb = () => {}) {
  
  MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, client) {
    if (err) {
      console.warn(err);
    }
    const collection = client.db('infoSec').collection('issues');
    console.log('Connected to database');
        
    app.route('/api/issues/:project')

      .get(async function (req, res){
        var project = req.params.project;
        const { _id, issue_title, issue_text, created_by, assigned_to, status_text, created_on, updated_on, open: openStr } = req.query;
        const open = openStr === 'true' || openStr === true;

        const data = collection
          .find(
            {
              project,
              // object values need conversion
              ...(_id ? { _id: new ObjectId(_id) } : {}),
              // if date is provided but not valid, still use.
              // Will then search with "Invalid Date" instance and return nothing
              // !Inconsistent with example project: exmaple project does not support searching by date
              ...(created_on !== undefined ? { created_on: new Date(created_on) } : {}),
              ...(updated_on !== undefined ? { updated_on: new Date(updated_on) } : {}),
              
              // if some string fields are empty (required or not), perform search with these fields still, may return nothing
              // Consistent with example project
              ...(issue_title !== undefined ? { issue_title } : {}),
              ...(issue_text !== undefined ? { issue_text } : {}),
              ...(created_by !== undefined ? { created_by } : {}),
              ...(assigned_to !== undefined ? { assigned_to } : {}),
              ...(status_text !== undefined ? { status_text } : {}),

              // if open field provided, use "true" when this field is "true", and use false otherwise
              // Consistent with example project
              ...(openStr !== undefined ? { open } : {}),
            },
            { projection: { project: 0 } }
          )
          .toArray((err, data) => {
            if (err) {
              return res.status(500).json({error: err});
            }
            res.json(data);
          });
      })

      .post(function (req, res){
        var project = req.params.project;
        const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;
      
        // if required fields are not provided OR ARE EMPTY, forbid POST
        // Consistent with example project
        for (const field of [ issue_title, issue_text, created_by ]) {
          if (!field) {
            return res.status(400).send('missing inputs');
          }
        }
      
        collection.insertOne({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
          created_on: new Date(),
          updated_on: new Date(),
          open: true,
        }, (err, result) => {
          if (err) {
            return res.status(500).json({error: err});
          }
          const { project, ...rest } = result.ops[0];
          res.json(rest);
        });
      })

      .put(function (req, res){
        var project = req.params.project;
        const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open: openStr } = req.body;
        const open = openStr === 'true' || openStr === true;

        if (
          // if some fields (required or not) are empty string, forbid PUT
          // Consistent with example project
          !issue_title && 
          !issue_text &&
          !created_by &&
          !assigned_to &&
          !status_text &&
          !openStr
        ) {
          return res.status(400).send('no updated field sent');
        }
      
        // exmaple project will update the newest document if not provided, and currupt if empty string is provided
        // do the same here to simplify test suite 
        /*
        if (!_id) {
          return res.send('_id error');
        }
        */
      
        collection.updateOne(
          {
            ...(_id ? { _id: new ObjectId(_id) } : {}),
            project
          },
          { $set: {
            updated_on: new Date(),
            ...(issue_title ? { issue_title } : {}),
            ...(issue_text ? { issue_text } : {}),
            ...(created_by ? { created_by } : {}),
            ...(assigned_to ? { assigned_to } : {}),
            ...(status_text ? { status_text } : {}),
            ...(openStr ? { open } : {}),
          } },
          (err) => {
            if (err) {
              return res.status(500).send(`could not update ${_id}`);
            }
            res.send('successfully updated');
          }
        );
      })

      .delete(function (req, res){
        var project = req.params.project;
        const { _id } = req.body;
      
        // Error if no or empty _id is provided
        // Consistent with example project
        if (!_id) {
          return res.status(400).send('_id error');
        }

        collection.deleteOne({ _id: new ObjectId(_id), project }, (err) => {
          if (err) {
            return res.status(500).send(`could not delete ${_id}`);
          }
          res.send(`deleted ${_id}`);
        })
      });
    
    cb();
  })
};
