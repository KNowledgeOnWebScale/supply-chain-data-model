const marked = require('marked');

/**
 * Id's come in as ex: "http://semweb.mmlab.be/ns/apps4X#Submission".
 * We only need: "Submission" at a lot of places in the template.
 * This pipe-module takes care of that.
 * This module also formats the dates, and parsed the markdown into html.
 */


function getClassNameFromUri(uri) {
  return uri.split('#')[1]
}

module.exports = {
  parseOnto: (queryResults) => {
    const ids = [];
    const results = [];

    queryResults.data.forEach(data => {
      if (!ids.includes(data.id)) {
        ids.push(data.id);
        results.push(data);

        if (data.id) {
          data.id_short = getClassNameFromUri(data.id);
        }

        if (data.domain) {
          data.domain_short = data.domain.map(a => getClassNameFromUri(a))
        }

        if (data.range) {
          data.range_short = data.range.map(a => getClassNameFromUri(a))
        }

        if (data.issued) {
          data.issued_formatted = new Date(data.issued).toDateString();
        }

        if (data.modified) {
          data.modified_formatted = new Date(data.modified).toDateString();
        }

        if (data.comment) {
          data.marked_comment = `<div class="markdown rounded-3">${marked(data.comment)}</div>`
        }

        if (data.description) {
          data.markedDescription = `<div class="markdown rounded-3">${marked(data.description)}</div>`
        }

        if (data.titleEN) {
          data.title = data.titleEN;
        }
      }
    });

    results.sort((a, b) => {
      if (a.id_short > b.id_short) {
        return 1;
      } else if (a.id_short < b.id_short) {
        return -1;
      } else {
        return 0;
      }
    });

    queryResults.data = results;
    return queryResults;
  },

  parseShapes(queryResults) {
    queryResults.data.forEach(shape => {
      shape.target = {
        link: shape.target,
        label: linkToLabel(shape.target)
      };

      shape.property.forEach(prop => {
        prop.path = {
          link: prop.path,
          label: linkToLabel(prop.path)
        }
      })
    });

    return queryResults;
  }
};

function linkToLabel(link) {
  if (link.includes('schema.org')) {
    return link.replace('https://schema.org/', 'schema:');
  } else if (link.includes('https://w3di.org/idlab/ns/supply-chain/#')) {
    return link.replace('https://w3di.org/idlab/ns/supply-chain/#', 'sc:');
  } else if (link.includes('http://www.w3.org/1999/02/22-rdf-syntax-ns#')) {
    return link.replace('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'rdf:');
  } else if (link.includes('http://purl.org/cerif/frapo/')) {
    return link.replace('http://purl.org/cerif/frapo/', 'frapo:');
  } else if (link.includes('https://www.industrialontologies.org/ontology/supplychain/SCRO/')) {
    return link.replace('https://www.industrialontologies.org/ontology/supplychain/SCRO/', 'scro:');
  } else if (link.includes('http://www.industrialontologies.org/core#')) {
    return link.replace('http://www.industrialontologies.org/core#', 'io:');
  }

  return link;
}