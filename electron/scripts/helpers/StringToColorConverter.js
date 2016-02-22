function StringToColorConverter() {

}

StringToColorConverter.convertToColorString = function (stringToConvertToColor) {

    var index = 0;
    
    var colors = [
    
            "#EF5350", // RED 400
            "#EC407A", // PINK 400
            "#AB47BC", // PURPLE 400
            "#7E57C2", // DEEP PURPLE 400
            "#5C6BC0", // INDIGO 400
            "#42A5F5", // BLUE 400
            "#29B6F6", // LIGHT BLUE 400
            "#26C6DA", // CYAN 400
            "#26A69A", // TEAL 400
            "#66BB6A", // GREEN 400
            "#9CCC65", // LIGHT_GREEN 400
            "#D4E157", // LIME 400
            "#FFEE58", // YELLOW 400
            "#FFCA28", // AMBER 400
            "#FFA726", // ORANGE 400
            "#FF7043", // DEEP ORANGE 400
            "#8D6E63", // BROWN 400
            "#BDBDBD", // GREY 400
            "#607D8B", // BLUE GREY 400
    
    ];
    
    if(stringToConvertToColor) {
    
        var hashCode = stringToConvertToColor.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
        index = Math.abs(hashCode % colors.length);
    
    }
    
    return colors[index];

};
