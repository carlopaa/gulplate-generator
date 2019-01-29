#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs');
const CURR_DIR = process.cwd();
const exclude = [
    'README.md',
    'LICENSE'
];

const QUESTIONS = [
    {
        name: 'project-name',
        type: 'input',
        message: 'Project name:',
        validate: function (input) {
            if (! /^([A-Za-z\-\_\d])+$/.test(input)) {
                return 'Project name may only include letters, numbers, underscores and hashes.';
            }

            return true;
        }
    },
    {
        name: 'description',
        type: 'input',
        message: 'Project description:'
    },
    {
        name: 'version',
        type: 'input',
        message: 'Version:',
        default: '1.0.0',
        validate: function (input) {
            if (! /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/.test(input)) {
                return 'Version should be a semver format';
            }

            return true;
        }
    },
    {
        name: 'author',
        type: 'input',
        message: 'Author:',
        validate: function (input) {
            if (! input) {
                return 'Author is required';
            }

            return true;
        }
    },
    {
        name: 'license',
        type: 'input',
        message: 'License:',
        default: 'MIT'
    },
    {
        name: 'homepage',
        type: 'input',
        message: 'Project URI:'
    },
    {
        name: 'repository',
        type: 'input',
        message: 'Repository:'
    }
];

inquirer.prompt(QUESTIONS)
    .then(answers => {
        const projectName = answers['project-name'];
        const templatePath = `${__dirname}/templates/gulplate`;

        fs.mkdirSync(`${CURR_DIR}/${projectName}`);

        createDirectoryContents(templatePath, projectName);
        createPackageJson(answers, `${CURR_DIR}/${projectName}`);

        console.log("\nAll set!");
        console.log(`cd to ${projectName} and run npm or yarn install`);
        console.log('Run yarn or npm run dev for development');
        console.log('Run yarn or npm run build for production');
        console.log('Happy Coding =)');
    });

function createDirectoryContents (templatePath, newProjectPath) {
    const filesToCreate = fs.readdirSync(templatePath);

    filesToCreate.forEach(file => {
        const origFilePath = `${templatePath}/${file}`;
        const stats = fs.statSync(origFilePath);

        if (stats.isFile() && exclude.indexOf(file) < 0) {
            const contents = fs.readFileSync(origFilePath, 'utf8');

            const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
            fs.writeFileSync(writePath, contents, 'utf8');
        }

        if (stats.isDirectory()) {
            fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);

            createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`);
        }
    });
}

function createPackageJson (answers, path) {
    let package = require(`${__dirname}/templates/gulplate/package.json`);

    package.name = answers['project-name'];
    package.description = answers['description'];
    package.version = answers['version'];
    package.author = answers['author'];
    package.license = answers['license'];
    package.homepage = answers['homepage'];
    package.repository = answers['repository'];
    package.keywords = [];

    delete package.bugs;

    fs.writeFileSync(`${path}/package.json`, JSON.stringify(package, null, 2));
}
