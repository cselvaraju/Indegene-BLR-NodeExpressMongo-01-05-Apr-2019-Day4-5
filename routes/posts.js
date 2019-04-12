const express = require('./node_modules/express');
const mongoose = require('mongoose');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth');

// Load Post Model
require('../models/Post');
const Post = mongoose.model('posts');

// Post Index Page
router.get('/', ensureAuthenticated, (req, res) => {
    Post.find({ user: req.user.id })
        .sort({ date: 'desc' })
        .then(posts => {
            res.render('posts/index', {
                posts: posts
            });
        });
});

// Add Post Form
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('posts/add');
});

// Edit Post Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Post.findOne({
        _id: req.params.id
    })
        .then(post => {
            if (post.user != req.user.id) {
                req.flash('error_msg', 'Not Authorized');
                res.redirect('/posts');
            } else {
                res.render('posts/edit', {
                    post: post
                });
            }

        });
});

// Process Form
router.post('/', ensureAuthenticated, (req, res) => {
    let errors = [];

    if (!req.body.title) {
        errors.push({ text: 'Please add a title' });
    }
    if (!req.body.body) {
        errors.push({ text: 'Please add some body text' });
    }

    if (errors.length > 0) {
        res.render('/add', {
            errors: errors,
            title: req.body.title,
            body: req.body.body
        });
    } else {
        const newUser = {
            title: req.body.title,
            body: req.body.body,
            user: req.user.id
        };
        new Post(newUser, {_id: false})
            .save()
            .then(post => {
                req.flash('success_msg', 'Blog post added');
                res.redirect('/posts');
            });
    }
});

// Edit Form process
router.put('/:id', ensureAuthenticated, (req, res) => {
    Post.findOne({
        _id: mongoose.Types.ObjectId(req.params.id)
    })
        .then(post => {
            // new values
            post.title = req.body.title;
            post.body = req.body.body;
            // post.id = mongoose.Types.ObjectId(req.params.id);

            Post.replaceOne({_id: mongoose.Types.ObjectId(req.params.id)}, post)
                .then(post => {
                    req.flash('success_msg', 'Blog post updated');
                    res.redirect('/posts');
                })
        });
});

// Delete Post
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Post.remove({ _id: mongoose.Types.ObjectId(req.params.id) })
        .then(() => {
            req.flash('success_msg', 'Blog post removed');
            res.redirect('/posts');
        });
});

module.exports = router;