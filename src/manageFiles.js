var fs = require("fs");


// Load sound set properties
const default_max_samples= 16;
const default_max_subsets = 4;
let rawdata = fs.readFileSync('./src/soundSetProperties.json');
let sound_set_properties = JSON.parse(rawdata);

const max_samples = (() => {
    if (sound_set_properties["max_samples"]) {
        return sound_set_properties["max_samples"];
    } else {
        console.log("No custom max samples found. Set to default (" + default_max_samples.toString() + ").");
        return default_max_samples;
    }
})();

const max_subsets = (() => {
    if (sound_set_properties["max_subsets"]) {
        return sound_set_properties["max_subsets"];
    } else {
        console.log("No custom max subsets found. Set to default (" + default_max_subsets.toString() + ").");
        return default_max_subsets;
    }
})();

// get the name of all the files in the directory dir
function getAllFileNames(dir) {
    var results = [];

    fs.readdirSync(dir).forEach(function (file) {

        file = dir + '/' + file;
        var stat = fs.statSync(file);

        //Only keep wav files
        var postfix = file.split('.');
        postfix = postfix[postfix.length - 1];

        if (stat && stat.isFile() && postfix == 'wav') {
            results.push(file);
        }
    });

    return results;
}

// get the name of all the subdirectories in the directory dir
function getAllSubDirNames(dir) {

    var results = [];

    fs.readdirSync(dir).forEach(function (file) {

        file = dir + '/' + file;
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results.push(file);
        }
    });
    return results;
}



//get the prefix to add in the public js files
function getPrefixPath(str) {
    let separated = str.split('/');
    let publicIndex = separated.findIndex(el => el == "public");
    separated = separated.slice(publicIndex + 1,separated.length-1);
    return '/' + separated.join('/');
}


//get the name of the directory or the file described by the path
function getPostfixPath(str) {
    let separated = str.split('/');
    return (str.split('/'))[separated.length - 1];
}

//create a dictionnary based on the sample set contained by path
function browseSampleSubSet(path) {
    let samples = getAllFileNames(path);
    let sample_subset_name = getPostfixPath(path);
    //Ne garder que fichier WAV
    if (samples.length <= 0) {
        console.log("No sample found in the subset " + sample_subset_name);
        return null;
    } else if (samples.length > max_samples) {
        console.log("To samples in the subset \"" + sample_subset_name + "\". Some samples will be ignored.");
        samples.slice(0, max_samples);
    }
    return samples.map(getPostfixPath);
}


function browseSampleSet(path) {
    let sample_subsets = getAllSubDirNames(path);
    let sample_set_name = getPostfixPath(path);
    if (sample_subsets.length <= 0) {
        console.log("No sample subset found in " + sample_set_name);
        return null;
    } else if (sample_subsets.length > max_subsets) {
        console.log("To much subsets in the set \"" + sample_set_name + "\". Some subsets will be ignored.");
        sample_subsets = sample_subsets.slice(0, max_subsets);
    }
    var dict_path = {};
    sample_subsets.forEach((sample_subset_path) => {
        let sample_subset_name = getPostfixPath(sample_subset_path);
        dict_path[sample_subset_name] = browseSampleSubSet(sample_subset_path);
    });
    return dict_path;
}

//Create a JSON file containing information for the public js to browse in the file hierarchy
function createJSONSampleSets(dir) {
    let sample_sets = getAllSubDirNames(dir);

    if (sample_sets.length > 0) {
        let pre_path = getPrefixPath(sample_sets[0]);
        console.log(pre_path);

        var dict_path = {};
        sample_sets.forEach((sample_set_path) => {
            let sample_set_name = getPostfixPath(sample_set_path);
            dict_path[sample_set_name] = browseSampleSet(sample_set_path);
        });
        json_dict = {
            "path_to_sounds": pre_path,
            "sample_sets": dict_path
        };

        console.log(JSON.stringify(json_dict));

        //fs.writeFileSync("./public/fileTree.json", JSON.stringify(json_dict));
        return json_dict;
    } else {
        console.log("No sample set found.");
    }
}

exports.createJSONSampleSets = createJSONSampleSets
