export function readTextFile(file) {
    var allText = "";
    var rawFile = new XMLHttpRequest();
    alert("d�but ");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                allText = rawFile.responseText;
                console.log(allText);
                alert(allText);
            } else {
                alert("�a marche pas");
            }
        } else {
            alert("toujours pas");
        }
    }
    rawFile.send(null);
    alert("fin")
    return allText;
}