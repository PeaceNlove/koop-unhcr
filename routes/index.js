// Defines the routes and params name that will be passed in req.params 
// routes tell Koop what controller method should handle what request route

module.exports = {
  // route : handler
  'post /unhcr': 'register',
  'get /unhcr': 'index',
  'get /unhcr/:id/' : 'getData',
  'get /unhcr/:id/FeatureServer': 'featureserver',
  'get /unhcr/:id/FeatureServer/:layer': 'featureserver',
  'get /unhcr/:id/FeatureServer/:layer/:method': 'featureserver',
  
}
