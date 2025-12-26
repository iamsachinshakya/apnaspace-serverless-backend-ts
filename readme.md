Here's a comprehensive MongoDB schema design for your blog application:
javascript// User Schema
const userSchema = {
\_id: ObjectId,
username: {
type: String,
required: true,
unique: true,
minLength: 3,
maxLength: 30
},
email: {
type: String,
required: true,
unique: true,
lowercase: true
},
password: {
type: String,
required: true,
minLength: 8
},
fullName: {
type: String,
required: true
},
profilePicture: {
type: String,
default: null
},
bio: {
type: String,
maxLength: 500,
default: ''
},
role: {
type: String,
enum: ['user', 'author', 'admin'],
default: 'user'
},
isVerified: {
type: Boolean,
default: false
},
social: {
twitter: String,
linkedin: String,
github: String,
website: String
},
followers: [{
type: ObjectId,
ref: 'User'
}],
following: [{
type: ObjectId,
ref: 'User'
}],
preferences: {
emailNotifications: {
type: Boolean,
default: true
},
marketingUpdates: {
type: Boolean,
default: false
},
twoFactorAuth: {
type: Boolean,
default: false
}
},
createdAt: {
type: Date,
default: Date.now
},
updatedAt: {
type: Date,
default: Date.now
},
lastLogin: {
type: Date
}
};

// Blog Post Schema
const blogPostSchema = {
\_id: ObjectId,
title: {
type: String,
required: true,
minLength: 10,
maxLength: 200
},
slug: {
type: String,
required: true,
unique: true
},
content: {
type: String,
required: true,
minLength: 100
},
excerpt: {
type: String,
maxLength: 300
},
author: {
type: ObjectId,
ref: 'User',
required: true
},
category: {
type: ObjectId,
ref: 'Category',
required: true
},
tags: [{
type: String,
lowercase: true
}],
featuredImage: {
url: String,
alt: String,
caption: String
},
status: {
type: String,
enum: ['draft', 'published', 'archived'],
default: 'draft'
},
visibility: {
type: String,
enum: ['public', 'private', 'unlisted'],
default: 'public'
},
viewCount: {
type: Number,
default: 0
},
likes: [{
user: {
type: ObjectId,
ref: 'User'
},
likedAt: {
type: Date,
default: Date.now
}
}],
readTime: {
type: Number, // in minutes
default: 0
},
seo: {
metaTitle: String,
metaDescription: String,
keywords: [String],
ogImage: String
},
publishedAt: {
type: Date
},
scheduledFor: {
type: Date
},
createdAt: {
type: Date,
default: Date.now
},
updatedAt: {
type: Date,
default: Date.now
}
};

// Category Schema
const categorySchema = {
\_id: ObjectId,
name: {
type: String,
required: true,
unique: true
},
slug: {
type: String,
required: true,
unique: true
},
description: {
type: String,
maxLength: 500
},
icon: {
type: String
},
color: {
type: String, // hex color code
default: '#6366f1'
},
parent: {
type: ObjectId,
ref: 'Category',
default: null
},
postCount: {
type: Number,
default: 0
},
isActive: {
type: Boolean,
default: true
},
createdAt: {
type: Date,
default: Date.now
}
};

// Comment Schema
const commentSchema = {
\_id: ObjectId,
post: {
type: ObjectId,
ref: 'BlogPost',
required: true
},
author: {
type: ObjectId,
ref: 'User',
required: true
},
content: {
type: String,
required: true,
minLength: 1,
maxLength: 1000
},
parentComment: {
type: ObjectId,
ref: 'Comment',
default: null
},
likes: [{
type: ObjectId,
ref: 'User'
}],
isEdited: {
type: Boolean,
default: false
},
isDeleted: {
type: Boolean,
default: false
},
createdAt: {
type: Date,
default: Date.now
},
updatedAt: {
type: Date,
default: Date.now
}
};

// Notification Schema
const notificationSchema = {
\_id: ObjectId,
recipient: {
type: ObjectId,
ref: 'User',
required: true
},
sender: {
type: ObjectId,
ref: 'User'
},
type: {
type: String,
enum: ['comment', 'like', 'follow', 'mention', 'reply', 'milestone'],
required: true
},
message: {
type: String,
required: true
},
relatedPost: {
type: ObjectId,
ref: 'BlogPost'
},
relatedComment: {
type: ObjectId,
ref: 'Comment'
},
isRead: {
type: Boolean,
default: false
},
createdAt: {
type: Date,
default: Date.now
}
};

// Analytics Schema
const analyticsSchema = {
\_id: ObjectId,
post: {
type: ObjectId,
ref: 'BlogPost',
required: true
},
date: {
type: Date,
required: true
},
views: {
type: Number,
default: 0
},
uniqueVisitors: {
type: Number,
default: 0
},
averageReadTime: {
type: Number, // in seconds
default: 0
},
bounceRate: {
type: Number,
default: 0
},
sources: {
direct: { type: Number, default: 0 },
search: { type: Number, default: 0 },
social: { type: Number, default: 0 },
referral: { type: Number, default: 0 }
},
devices: {
mobile: { type: Number, default: 0 },
desktop: { type: Number, default: 0 },
tablet: { type: Number, default: 0 }
},
countries: [{
code: String,
name: String,
count: Number
}]
};

// Bookmark Schema
const bookmarkSchema = {
\_id: ObjectId,
user: {
type: ObjectId,
ref: 'User',
required: true
},
post: {
type: ObjectId,
ref: 'BlogPost',
required: true
},
collection: {
type: String,
default: 'default'
},
createdAt: {
type: Date,
default: Date.now
}
};

// Media Schema
const mediaSchema = {
\_id: ObjectId,
uploader: {
type: ObjectId,
ref: 'User',
required: true
},
filename: {
type: String,
required: true
},
originalName: {
type: String,
required: true
},
mimeType: {
type: String,
required: true
},
size: {
type: Number,
required: true
},
url: {
type: String,
required: true
},
thumbnailUrl: {
type: String
},
alt: {
type: String
},
caption: {
type: String
},
dimensions: {
width: Number,
height: Number
},
uploadedAt: {
type: Date,
default: Date.now
}
};

// Report Schema (for flagged content)
const reportSchema = {
\_id: ObjectId,
reporter: {
type: ObjectId,
ref: 'User',
required: true
},
reportedItem: {
type: ObjectId,
required: true
},
itemType: {
type: String,
enum: ['post', 'comment', 'user'],
required: true
},
reason: {
type: String,
enum: ['spam', 'harassment', 'inappropriate', 'copyright', 'other'],
required: true
},
description: {
type: String,
maxLength: 500
},
status: {
type: String,
enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
default: 'pending'
},
createdAt: {
type: Date,
default: Date.now
},
resolvedAt: {
type: Date
},
resolvedBy: {
type: ObjectId,
ref: 'User'
}
};

// Newsletter Subscription Schema
const newsletterSchema = {
\_id: ObjectId,
email: {
type: String,
required: true,
unique: true,
lowercase: true
},
user: {
type: ObjectId,
ref: 'User'
},
isActive: {
type: Boolean,
default: true
},
frequency: {
type: String,
enum: ['daily', 'weekly', 'monthly'],
default: 'weekly'
},
subscribedAt: {
type: Date,
default: Date.now
},
unsubscribedAt: {
type: Date
},
verificationToken: {
type: String
},
isVerified: {
type: Boolean,
default: false
}
};
Key Features:

User Management - Complete user profiles with social links, followers, and preferences
Blog Posts - Full-featured posts with SEO, scheduling, and visibility controls
Categories & Tags - Hierarchical categories with custom icons and colors
Comments - Nested comments with likes and replies
Notifications - Real-time notifications for various actions
Analytics - Detailed tracking of views, sources, and user behavior
Bookmarks - Users can save posts to collections
Media Library - Centralized media management
Reports - Content moderation system
Newsletter - Email subscription management

Indexes to Add:
javascript// Recommended indexes for performance
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.blogPosts.createIndex({ slug: 1 }, { unique: true })
db.blogPosts.createIndex({ author: 1, status: 1 })
db.blogPosts.createIndex({ category: 1, status: 1 })
db.blogPosts.createIndex({ publishedAt: -1 })
db.comments.createIndex({ post: 1, createdAt: -1 })
db.notifications.createIndex({ recipient: 1, isRead: 1, createdAt: -1 })
db.analytics.createIndex({ post: 1, date: 1 })
This schema is production-ready and scalable for a modern blog platform!
