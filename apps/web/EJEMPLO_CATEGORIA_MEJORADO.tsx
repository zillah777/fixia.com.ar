// EJEMPLO DE PASO 2 MEJORADO - Categoría y Tags
// Este es un ejemplo de cómo debería verse el componente mejorado

function CategoryStep({
  data,
  setData,
  categories,
  loadingCategories
}: {
  data: ProjectData;
  setData: (data: ProjectData) => void;
  categories: ServiceCategory[];
  loadingCategories: boolean;
}) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(data.tags);
  const [categorySearch, setCategorySearch] = useState('');
  const [customSkill, setCustomSkill] = useState('');

  const handleSkillToggle = (skill: string) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(updated);
    setData({ ...data, tags: updated });
  };

  const handleAddCustomSkill = () => {
    const skill = customSkill.trim();
    if (skill && !selectedSkills.includes(skill) && selectedSkills.length < 8) {
      handleSkillToggle(skill);
      setCustomSkill('');
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(cat =>
    cat?.name?.toLowerCase().includes(categorySearch.toLowerCase()) ||
    cat?.description?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* CARD PRINCIPAL CON MEJOR DISEÑO */}
      <Card className="glass-glow border-white/20 shadow-xl overflow-hidden">
        <CardHeader className="space-y-4 bg-gradient-to-r from-primary/5 to-transparent pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3 text-2xl">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Tag className="h-6 w-6 text-white" />
              </div>
              <span>Categoría y Especialización</span>
            </CardTitle>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-3 py-1">
              2 de 6
            </Badge>
          </div>
          <CardDescription className="text-base text-muted-foreground/90 leading-relaxed">
            💡 <strong>Cómo funciona:</strong> Primero selecciona la <strong className="text-primary">categoría general</strong> de tu servicio (ej: Desarrollo Web).
            Luego agrega <strong className="text-success">habilidades específicas</strong> que te hacen único (ej: React, Node.js).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 p-6">
          {/* ========== CATEGORÍA PRINCIPAL ========== */}
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Categoría Principal *
              </Label>
              <Badge variant="outline" className="glass border-primary/30 text-primary">
                Paso 1 de 2
              </Badge>
            </div>

            {/* BARRA DE BÚSQUEDA */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="🔍 Busca tu categoría... (ej: Desarrollo, Diseño, Plomería, Electricista)"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="glass-glow border-white/30 pl-12 pr-4 py-6 text-base focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              {categorySearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setCategorySearch('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* ALERT INFORMATIVO */}
            <Alert className="glass-medium border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-transparent">
              <Info className="h-5 w-5 text-blue-400" />
              <AlertDescription className="text-sm text-blue-100/90 leading-relaxed">
                <strong>¿Qué es la categoría?</strong> Es la clasificación general de tu servicio que ayuda a los clientes a encontrarte.
                <br />
                <strong className="text-blue-300">Ejemplo:</strong> "Desarrollo Web" es una categoría. "React" y "Node.js" son habilidades que agregarás después.
              </AlertDescription>
            </Alert>

            {/* GRID DE CATEGORÍAS CON LOADING */}
            {loadingCategories ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, index) => (
                  <Card key={index} className="glass border-white/10 animate-pulse">
                    <CardContent className="p-5 text-center space-y-2">
                      <div className="h-12 w-12 bg-muted/50 rounded-xl mx-auto"></div>
                      <div className="h-5 bg-muted/50 rounded"></div>
                      <div className="h-3 bg-muted/30 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <Card className="glass-medium border-white/20 p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No se encontraron categorías con "<strong>{categorySearch}</strong>"
                </p>
                <Button
                  variant="outline"
                  className="glass border-white/20"
                  onClick={() => setCategorySearch('')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar búsqueda
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCategories.map((category) => {
                  if (!category || !category.id || !category.name) return null;

                  const Icon = getIconComponent(category.icon);
                  const isSelected = data.category === category.id;

                  return (
                    <Card
                      key={category.id}
                      className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? 'ring-2 ring-primary glass-glow shadow-lg shadow-primary/20 scale-[1.02]'
                          : 'glass hover:glass-medium border-white/20 hover:border-primary/40 hover:shadow-md'
                      }`}
                      onClick={() => setData({ ...data, category: category.id })}
                    >
                      <CardContent className="p-5 text-center relative">
                        {/* ICON CON GRADIENTE */}
                        <div className={`h-14 w-14 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-primary via-primary to-primary/70 shadow-lg shadow-primary/30'
                            : 'bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20'
                        }`}>
                          <Icon className={`h-7 w-7 ${isSelected ? 'text-white' : 'text-primary'}`} />
                        </div>

                        {/* NOMBRE */}
                        <div className={`font-semibold text-sm mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {category.name}
                        </div>

                        {/* DESCRIPCIÓN */}
                        {category.description && (
                          <div className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                            {category.description}
                          </div>
                        )}

                        {/* CHECKMARK */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg"
                          >
                            <Check className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========== HABILIDADES Y TAGS (Solo si hay categoría seleccionada) ========== */}
          {data.category && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-5 pt-6 border-t border-white/10"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-success" />
                  Habilidades y Tecnologías *
                </Label>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="glass border-success/30 text-success">
                    Paso 2 de 2
                  </Badge>
                  <Badge className={`${
                    selectedSkills.length === 8
                      ? 'bg-success/20 text-success border-success/30'
                      : 'bg-primary/20 text-primary border-primary/30'
                  }`}>
                    {selectedSkills.length}/8 tags
                  </Badge>
                </div>
              </div>

              {/* ALERT EXPLICATIVO DE TAGS */}
              <Alert className="glass-medium border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-transparent">
                <Lightbulb className="h-5 w-5 text-purple-400" />
                <AlertDescription className="text-sm text-purple-100/90 space-y-2">
                  <p className="font-semibold">¿Cómo agregar tags?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
                    <li>Haz clic en los tags sugeridos abajo</li>
                    <li>O escribe uno personalizado y presiona <kbd className="px-1.5 py-0.5 bg-purple-500/20 rounded text-xs">ENTER</kbd></li>
                    <li>Los tags ayudan a que los clientes te encuentren en búsquedas específicas</li>
                    <li>Ejemplo: Si sabes "React", agrégalo para que aparezca cuando busquen "desarrollador React"</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* TAGS SUGERIDOS */}
              {skillSuggestions[data.category as keyof typeof skillSuggestions]?.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Tags sugeridos (haz clic para agregar)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {skillSuggestions[data.category as keyof typeof skillSuggestions]?.map((skill) => (
                      <Button
                        key={skill}
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSkillToggle(skill)}
                        className={`transition-all ${
                          selectedSkills.includes(skill)
                            ? "bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-md shadow-primary/20"
                            : "glass border-white/20 hover:glass-medium hover:border-primary/40"
                        }`}
                        disabled={selectedSkills.length >= 8 && !selectedSkills.includes(skill)}
                      >
                        {selectedSkills.includes(skill) && <Check className="h-3.5 w-3.5 mr-1.5" />}
                        {skill}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* INPUT PARA TAG PERSONALIZADO */}
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  O agrega un tag personalizado
                </Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Escribe y presiona ENTER (ej: WordPress, Figma, Python)"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      className="glass border-white/20 pr-24"
                      disabled={selectedSkills.length >= 8}
                      maxLength={30}
                    />
                    <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-primary/10 text-primary text-xs rounded border border-primary/30">
                      ENTER
                    </kbd>
                  </div>
                  <Button
                    onClick={handleAddCustomSkill}
                    className="liquid-gradient"
                    disabled={!customSkill.trim() || selectedSkills.length >= 8}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>

              {/* TAGS SELECCIONADOS */}
              {selectedSkills.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Tags Seleccionados ({selectedSkills.length}/8)
                  </Label>

                  {/* PROGRESS BAR */}
                  <div className="space-y-1.5">
                    <Progress value={(selectedSkills.length / 8) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {8 - selectedSkills.length === 0
                        ? '¡Máximo alcanzado!'
                        : `Puedes agregar ${8 - selectedSkills.length} tag${8 - selectedSkills.length !== 1 ? 's' : ''} más`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30 px-3 py-1.5 pr-1.5 text-sm"
                      >
                        {skill}
                        <button
                          onClick={() => handleSkillToggle(skill)}
                          className="ml-2 hover:bg-primary/30 rounded-full p-1 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
