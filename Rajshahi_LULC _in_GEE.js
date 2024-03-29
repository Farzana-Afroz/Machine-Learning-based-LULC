
Map.addLayer(Rajshahi,{}, 'Raj-Boundary')
Map.centerObject(Rajshahi, 10);

var Rajimg5 = ee.Image(LS5_Raj
            .filterBounds(Rajshahi)
            .filterDate("2001-01-01", "2001-12-31")
            .filterMetadata("CLOUD_COVER",'less_than',1)
            .median()
            .clip(Rajshahi));
Map.addLayer(Rajimg5, {bands:['B5','B4', 'B3'],},'Raj-2001');

//Merge sample points together into one FeatureCollection
var landclass_2001 = tWater_bodies.merge(tVegetation).merge(tBuilt_up).merge(tBare_land);
print (landclass_2001);

//Select Bands from mosaic Image for training
var bands = ['B2','B3','B4','B5','B6','B7'];

//The name of the property on the points storing the class lebel
var classProperty = 'landcover';

//Sample the input imagery to get a FeatureCollection of training data
var training = Rajimg5.select(bands).sampleRegions({
  collection: landclass_2001,
  properties: ['landcover'],
  scale: 30
});
print (training);

///////////////   Train the classifier by CART ///////
var classifier = ee.Classifier.smileCart().train({
  features: training,
  classProperty:'landcover',
  inputProperties: bands,
});

//Classify the input imagery
var classified_2001 = Rajimg5.select(bands).classify(classifier);

//Define color palette
var palette = [
  '0b6cda',    // tWaterbody (0) // blue
  '16ea3e',   //tvegetation (1) // green
  'ff490b',  // tBuilt_up (2)  //red
  'fffd1b', //tBare_land (3)  // yellow
];

//Display the classified result 
Map.addLayer(classified_2001,
{min:0, max: 3, palette: palette},'Rajshahi Land-2001 Using CART');

////////////////Accuracy assessment///////////////////////////////////////

//Merge into one FeatureCollection
var valNames = vWater_bodies.merge(vVegetation).merge(vBuilt_up).merge(vBare_land);

var validation = classified_2001.sampleRegions({
  collection: valNames,
  properties: ['landcover'],
  scale: 30,
});
print(validation);

//Compare the landcover of validation data against the classification result
var testAccuracy = validation.errorMatrix('landcover', 'classification');
//Print the error matrix to the console
print('Validation error matrix: ', testAccuracy);
//Print the overall accuracy to the console
print('Validation overall accuracy:by CART', testAccuracy.accuracy());

// // Calculate kappa statistic from CART // //

var array = ee.Array([[73, 1, 2,  0],
                      [ 3, 70, 4, 2],
                      [ 0, 1, 65, 2],
                      [ 2, 2, 2, 61]]);

var confusionMatrix = ee.ConfusionMatrix(array);
print("Constructed confusion matrix", confusionMatrix);

print('Kappa statistic from CART', confusionMatrix.kappa());

// Calculate consumer's accuracy, also known as user's accuracy or
// specificity and the complement of commission error (1 − commission error).
print("Consumer's accuracy", confusionMatrix.consumersAccuracy());

// Calculate producer's accuracy, also known as sensitivity and the
// compliment of omission error (1 − omission error).
print("Producer's accuracy", confusionMatrix.producersAccuracy());

/////////////////Train the classifier by RF////////////////

var classifier = ee.Classifier.smileRandomForest(300).train({
  features: training,
  classProperty:'landcover',
  inputProperties: bands,
});

//Classify the input imagery
var classified_2001 = Rajimg5.select(bands).classify(classifier);

//Define color palette
var palette = [
  '0b6cda',    // tWaterbody (0) // blue
  '16ea3e',   //tvegetation (1) // green
  'ff490b',  // tBuilt_up (2)  //red
  'fffd1b', //tBare_land (3)  // yellow
];

//Display the classified result 
Map.addLayer(classified_2001,
{min:0, max: 3, palette: palette},'Rajshahi Land-2001 Using RF');

///////////////////Accuracy assessment

//Merge into one FeatureCollection
var valNames = vWater_bodies.merge(vVegetation).merge(vBuilt_up).merge(vBare_land);

var validation = classified_2001.sampleRegions({
  collection: valNames,
  properties: ['landcover'],
  scale: 30,
});
print(validation);

//Compare the landcover of validation data against the classification result
var testAccuracy = validation.errorMatrix('landcover', 'classification');
//Print the error matrix to the console
print('Validation error matrix: ', testAccuracy);
//Print the overall accuracy to the console
print('Validation overall accuracy:by RF', testAccuracy.accuracy());

// // Calculate kappa statistic from RF // //

var array = ee.Array([[72, 1, 2,  1],
                      [ 0, 72, 4, 3],
                      [ 0, 0, 67, 1],
                      [ 0, 3, 1, 63]]);

var confusionMatrix = ee.ConfusionMatrix(array);
print("Constructed confusion matrix", confusionMatrix);

print('Kappa statistic from RF', confusionMatrix.kappa());

// Calculate consumer's accuracy, also known as user's accuracy or
// specificity and the complement of commission error (1 − commission error).
print("Consumer's accuracy", confusionMatrix.consumersAccuracy());

// Calculate producer's accuracy, also known as sensitivity and the
// compliment of omission error (1 − omission error).
print("Producer's accuracy", confusionMatrix.producersAccuracy()); 

////////////Train the classifier by SVM

var classifier = ee.Classifier.libsvm({
  kernelType: 'RBF',
  gamma: 0.5,
  cost: 10
});

// Train the classifier.
var trained = classifier.train(training, 'landcover', bands);

// Classify the image.
var classified_2001 = Rajimg5.classify(trained);

//Define color palette
var palette = [
  '0b6cda',    // tWaterbody (0) // blue
  '16ea3e',   //tvegetation (1) // green
  'ff490b',  // tBuilt_up (2)  //red
  'fffd1b', //tBare_land (3)  // yellow
];

//Display the classified result 
Map.addLayer(classified_2001,
{min:0, max: 3, palette: palette},'Rajshahi Land-2001 Using SVM');

//Accuracy assessment

//Merge into one FeatureCollection
var valNames = vWater_bodies.merge(vVegetation).merge(vBuilt_up).merge(vBare_land);

var validation = classified_2001.sampleRegions({
  collection: valNames,
  properties: ['landcover'],
  scale: 30,
});
print(validation);

//Compare the landcover of validation data against the classification result
var testAccuracy = validation.errorMatrix('landcover', 'classification');
//Print the error matrix to the console
print('Validation error matrix: ', testAccuracy);
//Print the overall accuracy to the console
print('Validation overall accuracy:by SVM', testAccuracy.accuracy());

// // Calculate kappa statistic from SVM // //

var array = ee.Array([[71, 1, 3,  1],
                      [ 0, 72, 4, 3],
                      [ 0, 0, 68, 0],
                      [ 0, 5, 4, 58]]);

var confusionMatrix = ee.ConfusionMatrix(array);
print("Constructed confusion matrix", confusionMatrix);

print('Kappa statistic from SVM', confusionMatrix.kappa());

// Calculate consumer's accuracy, also known as user's accuracy or
// specificity and the complement of commission error (1 − commission error).
print("Consumer's accuracy", confusionMatrix.consumersAccuracy());

// Calculate producer's accuracy, also known as sensitivity and the
// compliment of omission error (1 − omission error).
print("Producer's accuracy", confusionMatrix.producersAccuracy());

/////////////////////Area Chart Of A Classified Image

var area_chart = ui.Chart.image.byClass({
  image: ee.Image.pixelArea().multiply(1e-4).addBands(classified_2001.rename('classification')),
  classBand: 'classification', 
  region: Rajshahi, 
  reducer: ee.Reducer.sum(), 
  scale: 30, 
  classLabels: ['tWater_bodies','tVegetation','tBuilt_up','tBare_land']}).setOptions({
    title: 'Rajshahi City Landuse Area(Ha) in 2001',
    hAxis: {title:'Landuse Classification 2001'},
    vAxis: {title:'Area (Ha)'},
    colors: ['0b6cda','16ea3e','ff490b','fffd1b']
  })

print(area_chart); 

////////////  
/*for raster export from CART

Export.image.toDrive({
  image: classified_2001.clip(Rajshahi),
  description: 'CART_LULC_Rajshahi_2001',
  region: Rajshahi,
  scale: 30,
  folder: 'GEE Maps',
  maxPixels: 1e13})  */

/* for raster export from RF

Export.image.toDrive({
  image: classified_2001.clip(Rajshahi),
  description: 'RF_LULC_Rajshahi_2001',
  region: Rajshahi,
  scale: 30,
  folder: 'GEE Maps',
  maxPixels: 1e13}) */

/* for raster export from SVM

Export.image.toDrive({
  image: classified_2001.clip(Rajshahi),
  description: 'SVM_LULC_Rajshahi_2001',
  region: Rajshahi,
  scale: 30,
  folder: 'GEE Maps',
  maxPixels: 1e13}) */
