import { BehaviorSubject } from 'rxjs';

export const site = new BehaviorSubject();

fetch('/api/site')
    .then(response => response.json())
    .then(data => {
        // Update the HTML page title with the site name
        document.title = data.name;
        site.next(data);
    });


