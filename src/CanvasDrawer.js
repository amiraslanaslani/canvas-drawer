function CanvasDrawer(info){

    this.loadDataFromInfo = function(name, defaultValue) {
        return (name in this.info) ? this.info[name] : defaultValue;
    };


    // Drawer's APIs
    this.draw = function(r, g, b, a){
        this.drawer.draw(this.positionMaker.positions, r, g, b, a);
        this.positionMaker.reset();
    }


    this.justDraw = function(){
        this.drawer.justDraw(this.positionMaker.positions);
        this.positionMaker.reset();
    }


    this.loadTexture = function(image, unit){
        this.drawer.setTexture(image, unit);
    }


    this.imagesLoadTexture = function(images, callback=()=>{}){
        var imageLoadUnit = 0;
        var imagesToTextureMap = [];
        var maximumTextureUnits = this.drawer.getMaximumTextureUnits();

        images.forEach(async (image) => {
            let unit = imageLoadUnit;
            imageLoadUnit ++;
            imagesToTextureMap[image.idName] = unit >= maximumTextureUnits ? -1 : unit;
            this.loadTexture(image, unit);
        });

        callback(imagesToTextureMap);
    }


    this.loadTextures = function(imagesList, callback=()=>{}){
        var imagesLoaded = 0;
        var imagesCount = imagesList.length;
        var imagesObjects = [];

        var imagesLoadTexture = (images) => {
            this.imagesLoadTexture(images, callback);
        }

        imagesList.forEach((imageUrl) => {
            let image = new Image();
            image.idName = imageUrl;
            imagesObjects.push(image);
            image.onload = () => {
                imagesLoaded ++;
                if(imagesLoaded == imagesCount){
                    imagesLoadTexture(imagesObjects);
                }
            };
            image.src = imageUrl;
        });
    }


    // Constructor
    this.constructor = function(info){
        this.info = info;

        var id = this.loadDataFromInfo('id', false);
        var errorFunction = this.loadDataFromInfo('error', function(){});
        var isCartographerEnable = this.loadDataFromInfo('cartographer', false);
        var zoomInRate = this.loadDataFromInfo('zoominrate', 1.1);
        var zoomOutRate = this.loadDataFromInfo('zoomoutrate', 0.9);

        if(id === false){
            console.log("CanvasDrawer can not found element with id that you pass or maybe you don't pass any id!");
            return;
        }

        // Set Drawer
        this.drawer = new Drawer(id, errorFunction);

        // Set Cartographer
        if(isCartographerEnable){
            let drawer = this.drawer;

            var setReativeTranslation = function(rx, ry, px, py, tpx, tpy){
                drawer.setTextureTranslation(tpx + rx, tpy + ry);
                drawer.updateTranslation(px + rx, py + ry);
            }

            var getPinPoint = function(){
                return drawer.translation;
            }

            var getTexturePinPoint = function(){
                return drawer.texTranslation;
            }

            var zoominAction = function (x,y) {
                let scale = drawer.scale[0];
                drawer.updateScaleIntoPoint(scale * zoomInRate,x,y);
            }

            var zoomoutAction = function (x,y) {
                let scale = drawer.scale[0];
                drawer.updateScaleIntoPoint(scale * zoomOutRate,x,y);
            }

            this.cartographer = new Cartographer("c", setReativeTranslation, getPinPoint, getTexturePinPoint, zoominAction, zoomoutAction);
        }

        // Set Position Maker
        this.positionMaker = new PositionMaker();

        this.addPolygon = (vertices)=>this.positionMaker.addPolygon(vertices);
        this.addLine = (x1,y1,x2,y2,width)=>this.positionMaker.addLine(x1,y1,x2,y2,width);
        this.addCircle = (cx,cy,r,cuts=15)=>this.positionMaker.addCircle(cx,cy,r,cuts=15);
        this.addSequenceLine = (positions, width)=>this.positionMaker.addSequenceLine(positions, width);
    }


    // Main
    this.constructor(info);
}