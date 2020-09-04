You're seeing this message because you are using `norska-theme-docs` but haven't
configured it yet.

## Configuration

Create a `./src/_data/theme.json` file with content similar to this one to
update the navigation links:

```json
[
  {
    "name": "Overview",
    "links": [
      {
        "title": "Installation",
        "href": "install"
      },
      {
        "title": "Quick tour",
        "href": "tutorial"
      }
    ]
  },
  {
    "name": "Documentation",
    "links": ["copy", "emptyDir"]
  }
]
```
