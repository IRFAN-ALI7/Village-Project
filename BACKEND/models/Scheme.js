const express = require('express');
const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
    name: {
        type: String,   
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Housing', 'Agriculture', 'Health','Education', 'Social Welfare', 'Employment', 'Women Empowerment', 'Environment']
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    officialLink: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date, 
    },
    description: {
        type: String,
        required: true
    },
    eligibility: {
        type: String,
        required: true
    },
    documents: {
        type: String,
    },
}, { timestamps: true });

const Scheme = mongoose.model('Scheme', schemeSchema);

module.exports = Scheme;