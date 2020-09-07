# Setting up Elastic search on a Drupal site

## VM configuration

Add 127.0.0.1 elastic to VM host file (sudo nano /etc/hosts)

## Enable modules

Enable these modules:
- Search API
- Search API Elasticsearch (Elastica Client)
- Search API elasticsearch

## Create a search sever

Go to /admin/config/search/search_api

1. Add server  
  Server name: Elastic search  
  Service class: Elasticsearch (via Elastica)

2. Open tab: Node 1  
  Change host to 'elastic'  
  Remove basic auth username and password (*leave empty)

3. Click 'Create server'

## Create a search index

Go to /admin/config/search/search_api

Drupal includes a 'Default node index' but we can't use this one, so either ignore it or delete it.

1. Add index  
  Index name: Default content index (or a suitable name to describe what the index is for)  
  Item type: Content  
  Server: Elastic search (or whichever one you created above)

2. Click 'Create index'

You should end up on the ***Fields tab***, if not, click on Fields.
 
* If you cannot find the fields you want, open the 'Add related fields' toggle at the bottom of the page and add them.
* If they are multi-value fields, choose the Value one (e.g. field_uq_basic_body:value)

Tick the fields to be indexed. e.g.:
- Title
- Tags
- All body/description fields
- All summary fields

Don't include hidden fields or ones you wouldn't want to be indexed such as 'UQ username'.

Go to the ***Filters tab***.

Filters can be configured as required, but some sensible ones are:  
Processors:
- Ignore case
- HTML filter

Save

Go to ***View tab***

Click 'Index now' to trigger the first indexing process.

## Facets (optional)

Facets allow you to expose filters on the search results page to narrow down results. This is useful for things like 
taxonomy terms.

### Enable modules:
- Facetapi
- Search facets
- Search Views

### Configure facets

Go to /admin/config/search/search_api/index/default_content_index/facets

1. Enable all fields that you need to facet.
2. For each facet to configure (e.g. uq_tags); change the 'Display widget' field to 'Links with checkboxes'
3. Save

Facets become blocks which can be added to the search results page in order to affect the results listed in the View.

## Search results View

1. Create a new View:  
  View name: Search results  
  Show: Default content index (or whatever you called the search index you want to display)
2. Configure View to display results as desired. Either with a viewmode like Teaser, or by adding relevant fields.


## Search results page

1. Create a panels page called 'Search results'  
  URL '/search'
2. Add facet blocks to the left column
3. Add search results view to main column
