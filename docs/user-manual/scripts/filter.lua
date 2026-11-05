-- Pandoc filter: fills {{name}} placeholders with metadata values (e.g. version, date)
-- and centers paragraphs that contain only images.

local vars = {}

local function is_image_only(inlines)
  local has_image = false
  for _, el in ipairs(inlines) do
    if el.t == "Image" then
      has_image = true
    elseif el.t ~= "Space" and el.t ~= "SoftBreak" then
      return false
    end
  end
  return has_image
end

return {
  {
    Meta = function(meta)
      for key, value in pairs(meta) do
        vars[key] = pandoc.utils.stringify(value)
      end
    end,
  },
  {
    Str = function(str)
      local text = str.text:gsub("{{(%w+)}}", function(key)
        return vars[key]
      end)
      return pandoc.Str(text)
    end,
    Para = function(para)
      if is_image_only(para.content) then
        return pandoc.Div(para, { ["custom-style"] = "Image" })
      end
    end,
  },
}
