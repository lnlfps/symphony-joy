// @ts-ignore 默认的安装v1.4.0 版本和webpack的5的类型定义冲突，所以这里暂时不用校验
import loaderUtils from "loader-utils";
import path from "path";
import webpack from "webpack";
import { webpack5 } from "../../../../../../types/webpack5";
import LoaderContext = webpack5.loader.LoaderContext;

const regexLikeIndexModule = /(?<!pages[\\/])index\.module\.(scss|sass|css)$/;

export function getCssModuleLocalIdent(
  context: LoaderContext,
  _: any,
  exportName: string,
  options: object
) {
  const relativePath = path
    .relative(context.rootContext, context.resourcePath)
    .replace(/\\+/g, "/");

  // Generate a more meaningful name (parent folder) when the user names the
  // file `index.module.css`.
  const fileNameOrFolder = regexLikeIndexModule.test(relativePath)
    ? "[folder]"
    : "[name]";

  // Generate a hash to make the class name unique.
  const hash = loaderUtils.getHashDigest(
    Buffer.from(`filePath:${relativePath}#className:${exportName}`),
    "md5",
    "base64",
    5
  );

  // Have webpack interpolate the `[folder]` or `[name]` to its real value.
  return (
    loaderUtils
      .interpolateName(
        context,
        fileNameOrFolder + "_" + exportName + "__" + hash,
        options
      )
      .replace(
        // Webpack name interpolation returns `about.module_root__2oFM9` for
        // `.root {}` inside a file named `about.module.css`. Let's simplify
        // this.
        /\.module_/,
        "_"
      )
      // Replace invalid symbols with underscores instead of escaping
      // https://mathiasbynens.be/notes/css-escapes#identifiers-strings
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      // "they cannot start with a digit, two hyphens, or a hyphen followed by a digit [sic]"
      // https://www.w3.org/TR/CSS21/syndata.html#characters
      .replace(/^(\d|--|-\d)/, "__$1")
  );
}