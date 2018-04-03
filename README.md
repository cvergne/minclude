# minclude
hinclude with merged request

**! Work in progress, not ready yet for production use**

## How to use

```html
<html xmlns:hx="http://purl.org/NET/hinclude">
    <head>
      <script src="/lib/minclude.js" type="text/javascript"></script>
  …
```

Then,

```html
<!-- Single entry -->
<hx:include src="/other/document/here.html"></hx:include>

<!-- Merged entries -->
<hx:include entry="inbox" src="/api/user.json"></hx:include>
<hx:include entry="profile" src="/api/user.json">
    <img src="default_picture.png" alt="Avatar" />
</hx:include>
```