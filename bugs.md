Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `Home`.

app\page.tsx (26:11) @ Home


  24 |         <AuroraBackground className="h-[80vh] md:h-[70vh]">
  25 |           {/* Content from bugs.md demo */}
> 26 |           <motion.div
     |           ^
  27 |             initial={{ opacity: 0.0, y: 40 }}
  28 |             whileInView={{ opacity: 1, y: 0 }}
  29 |             transition={{