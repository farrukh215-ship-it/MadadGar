const { withGradleProperties, withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Fix Kotlin 1.9.24 vs Compose Compiler 1.5.15 mismatch on EAS Build.
 * - Sets android.kotlinVersion=1.9.25 in gradle.properties
 * - Adds suppressKotlinVersionCompatibilityCheck to all KotlinCompile tasks
 */
function withKotlinComposeFix(config) {
  if (!config || !config.expo) return config;
  config = withGradleProperties(config, (c) => {
    if (!Array.isArray(c.modResults)) return c;
    const existing = c.modResults.find((p) => p.type === 'property' && p.key === 'android.kotlinVersion');
    if (existing) {
      existing.value = '1.9.25';
    } else {
      c.modResults.push({ type: 'property', key: 'android.kotlinVersion', value: '1.9.25' });
    }
    return c;
  });

  config = withProjectBuildGradle(config, (c) => {
    const block = `subprojects { subproject ->
  subproject.afterEvaluate {
    subproject.tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
      kotlinOptions {
        freeCompilerArgs += [
          "-P",
          "plugin:androidx.compose.compiler.plugins.kotlin:suppressKotlinVersionCompatibilityCheck=true"
        ]
      }
    }
  }
}`;
    const contents = c.modResults.contents || c.modResults;
    if (typeof contents === 'string' && !contents.includes('suppressKotlinVersionCompatibilityCheck')) {
      const pattern = /(apply plugin: "com\.facebook\.react\.rootproject")\s*\n(\s*allprojects)/;
      const newContents = contents.replace(pattern, `$1\n${block}\n$2`);
      if (c.modResults.contents !== undefined) {
        c.modResults.contents = newContents;
      } else {
        c.modResults = newContents;
      }
    }
    return c;
  });

  return config;
}

module.exports = withKotlinComposeFix;
