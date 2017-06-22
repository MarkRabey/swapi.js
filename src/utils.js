import pkg from '../package.json';
import Schemas from '../resources/schemas';
import Data from '../resources/data';

const resourceNames = Object.keys(Schemas);
console.log(resourceNames);

const apiInfo = (server) => {
  const objects = {};
  for (var object in Schemas) {
    if (Schemas.hasOwnProperty(object)) {
      objects[object] = `${ server.info.uri }/api/${ object }`
    }
  }
  return {
    name: 'SWAPI.js',
    version: pkg.version,
    objects
  }
}

const objectNote = () => {
  return '<code>resource</code> can be one of <code>films</code>, <code>people</code>, <code>planets</code>, <code>species</code>, <code>starships</code>, or <code>vehicles</code>.';
}

const retrieveFormattedObject = (resource, id) => {
  if (!resourceNames.includes(resource)) {
    return null;
  };

  const schema = Schemas[resource];
  if (id) {
    const object = Data[resource].find(x => x.pk === id);
    const values = {};

    for (let property in schema.properties) {

      if (resourceNames.includes(property)) {
        const linkedResourceName = getLinkedResourceName(resource, property);
        values[property] = Data[property].filter(x => x.fields[linkedResourceName] && x.fields[linkedResourceName].includes(id))
          .map(x => x.pk);
      } else {
        values[property] = object.fields[property]
      }
      
    }   
    return values;
  }

  return {};
};

const getLinkedResourceName = (resource, linkedTo) => {
  if (resource === 'people' && linkedTo === 'films') {
    return "characters";
  } else if (resource === 'people' && linkedTo === 'planets') {
    return "residents";
  } else if (resource === 'planets' && linkedTo === 'people') {
    return "homeworld";
  }

  return resource;
}

export { apiInfo, objectNote, retrieveFormattedObject };