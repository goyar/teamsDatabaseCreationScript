# teamsDatabaseCreationScript
MongoDB creation Script for NodeJS and Mongoose

## Contact Information
Written by Gonzalo Oyarce  
gonzalo.oyarce@gmail.com  
2019-06-30  
********************************************************************

## General Information
* This script is a data manipulation exercise in Node, using 
mongoose.
* This script is meant to create a MongoDB database for development 
and testing and will be use as the data storage for an RESTful API.
* The data sources, that contains the mock data set, are JSON files 
at the `./data` folder. These files are read by the script and used 
to create collections in the data base.
* The script enforces a number of business rules by creating cross 
references between collections.
* By running this script, all the collections described in it will 
be dropped and created again with their initial data set.
* The original data set can be modified or extended by manipulating 
the JSON files at the `./data` folder.
********************************************************************

## Collections Created
Collection Name | Documents
--------------- | ---------
categories | 4
coaches | 10
guardians | 80
players | 89
teams | 7
********************************************************************
