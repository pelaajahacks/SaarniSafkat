module.exports = {
    get_rating: function (food) {
        var good_foods = [
            "pinaattilettu", "pinaattiletut", "kalaleike", "kalapuikko",
            "kananugetti", "kananuggetti", "lohkoperuna", "pipari", "kakku",
            "torttu", "jäätelö", "toiveruoka", "nugetti", "nuggetti", "kebab",
            "perunamuusi", "perunasose", "tortilla", "taco", "hampurilainen",
            "burger", "pizza", "pitsa", "lasagnette", "lasagna",
            "koululaisen kalaleike", "pestopasta", "pasta", "pinaatti", "nakki",
            "nakkikeitto", "kasvisnakkikeitto", "tomaatti", "pihvi", "possuhöystö",
            "spagettivuoka", "pasta", "ketsuppi", "tomaattikastike", "chili",
            "pinaattiohukaiset", "kasvis-jalapenonugetit",
            "pinaatti-pestopastavuoka", "kebabkastike"
        ];
        var bad_foods = [
            "härkäpapu", "papu", "sieni", "sosekeitto", "rucola", "kikherne",
            "parsa", "kaali", "vuohenjuusto", "paprika", "feta", "lanttu",
            "kesäkurpitsa", "palsternakka", "punajuuri", "tofu", "nokkos",
            "nokkonen", "juuressose", "herkkusieni", "kanttarelli", "tatti",
            "purjo", "selleri", "kaalikääryle", "kevätkääryle", "kukkakaali",
            "lehtikaali", "kookos", "beanit", "falafel", "keitto", "lihakeitto",
            "juusto", "broileri-juustopasta", "broileri", "juustopasta", "vaalea",
            "vaaleakastike", "punajuuripihvi", "kikhernepastavuoka",
            "Italialainen jauhelihakeitto", "papukeitto", "kookos",
            "kookoscurrykala", "Appelsiinitofu", "Quorn-makaronilaatikko", "Quorn", "Taco-broilerivuoka", "broilerivuoka", "Mifu", "Mifu-pinaattikiusaus", "Mifu-pinaatti", "kiusaus"
        ];
        var hard_coded = ["Quorn"];
        var bad = "Pahaksi!";
        var neutral = "Neutraaliksi!";
        var good = "Hyväksi!";
        var goods = neutrals = bads = 0;
        var bad_or_good = neutrals;
    
        for(good_food of good_foods) {
            if(food.toLowerCase().includes(good_food.toLowerCase())) {
                goods = goods + 1;
            }
        }
            
            
        for(bad_food of bad_foods) {
            if(food.toLowerCase().includes(bad_food.toLowerCase())) {
                bads += 1
            }
        }
            
    
        for(hard_coded_food of hard_coded) {
            if(food.toLowerCase().includes(hard_coded_food.toLowerCase())) {
                bads += 999999
            }
        }
            
        if(goods > bads){
            bad_or_good = good
        }
        if(bads > goods) {
            bad_or_good = bad
        }
        if(bads === goods || neutral > bads && neutral > goods) {
            bad_or_good = neutral
        }
            
    
        return bad_or_good
    }
        
};

